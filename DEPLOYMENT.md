# ShiJu 部署文档

**最后更新**：2026-07-07

本文档记录 ShiJu 项目的部署流程、配置要点和常见问题。

---

## 生产环境信息

- **服务器**：43.128.11.119
- **前端地址**：http://43.128.11.119/shiju/
- **API 地址**：http://43.128.11.119/shiju/api/
- **健康检查**：http://43.128.11.119/shiju/api/health

---

## 后端部署

### 1. 服务管理

**服务名称**：`shiju-api.service`（systemd user service）

```bash
# 查看状态
systemctl --user status shiju-api

# 启动服务
systemctl --user start shiju-api

# 停止服务
systemctl --user stop shiju-api

# 重启服务
systemctl --user restart shiju-api

# 查看日志
journalctl --user -u shiju-api -n 50 -f

# 健康检查
curl http://localhost:3001/health
```

### 2. 配置文件

**Systemd 配置**：`~/.config/systemd/user/shiju-api.service`

```ini
[Unit]
Description=ShiJu API Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/ubuntu/ShiJu
EnvironmentFile=/home/ubuntu/ShiJu/.env
ExecStart=/usr/bin/pnpm --filter @art/api start
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

**环境变量**：`~/ShiJu/.env`

```bash
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/shiju

# AI Provider
AI_PROVIDER=openai_compatible
AI_BASE_URL=https://api.example.com/v1
AI_API_KEY=sk-xxx
AI_MODEL=gpt-4o

# 服务器
PORT=3001
NODE_ENV=production
```

### 3. 部署流程

```bash
cd ~/ShiJu

# 1. 拉取最新代码
git pull

# 2. 安装依赖（如有变化）
pnpm install

# 3. 重启服务
systemctl --user restart shiju-api

# 4. 验证
curl http://localhost:3001/health
```

### 4. 常见问题

#### 端口被占用（EADDRINUSE）

```bash
# 查找占用 3001 端口的进程
lsof -ti:3001

# 杀掉进程
lsof -ti:3001 | xargs -r kill -9

# 重启服务
systemctl --user restart shiju-api
```

#### 服务启动失败

```bash
# 查看详细错误
journalctl --user -u shiju-api -n 100 --no-pager

# 常见原因：
# 1. .env 文件缺失或格式错误
# 2. 数据库连接失败
# 3. 端口被占用
# 4. 依赖未安装
```

---

## 前端部署

### 1. 构建配置

**环境变量**：`~/ShiJu/apps/web/.env.production`

```bash
VITE_API_BASE_URL=/shiju/api
```

**重要**：前端通过 nginx 反向代理访问 API，API 地址必须是 `/shiju/api`，不能是 `http://43.128.11.119:3001`。

### 2. 构建流程

```bash
cd ~/ShiJu

# 1. 构建前端（跳过类型检查，因为有测试文件的类型错误）
pnpm --filter @art/web run build:skip-check

# 2. 检查构建产物
ls -lh apps/web/dist/assets/

# 3. 部署到 nginx 目录
sudo rsync -av --delete apps/web/dist/ /var/www/shiju/

# 4. 验证
curl -s http://43.128.11.119/shiju/ | grep -o '<title>.*</title>'
```

**注意**：
- 不要使用 `pnpm build`（会因为测试文件类型错误失败）
- 使用 `pnpm --filter @art/web run build:skip-check`（跳过 tsc 检查）
- 构建时不要设置 `VITE_API_BASE_URL` 环境变量，使用 `.env.production` 的默认值

### 3. Nginx 配置

**配置文件**：`/etc/nginx/sites-available/shiju`

```nginx
server {
    listen 80;
    server_name 43.128.11.119;
    
    # ShiJu API 反向代理
    location /shiju/api/ {
        rewrite ^/shiju/api/(.*) /$1 break;
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置（AI 生成候选表达式可能需要较长时间）
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # ShiJu 前端静态文件
    location /shiju/ {
        alias /var/www/shiju/;
        index index.html;
        try_files $uri $uri/ /shiju/index.html;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # 静态资源缓存
    location ~* ^/shiju/.*\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        alias /var/www/shiju/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**启用配置**：

```bash
# 创建符号链接
sudo ln -sf /etc/nginx/sites-available/shiju /etc/nginx/sites-enabled/shiju

# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

### 4. 常见问题

#### API 请求 404 或返回 HTML

**原因**：前端构建时使用了错误的 API URL

**解决**：
1. 检查 `apps/web/.env.production` 是否为 `VITE_API_BASE_URL=/shiju/api`
2. 重新构建：`pnpm --filter @art/web run build:skip-check`
3. 重新部署：`sudo rsync -av --delete apps/web/dist/ /var/www/shiju/`

#### Nginx 配置冲突

**症状**：nginx -t 显示 "conflicting server name"

**原因**：多个 server 块使用相同的 `server_name`

**解决**：
- 确保只有一个配置文件使用 `server_name 43.128.11.119;`
- 其他项目应该使用域名或不同的 server_name

#### 前端显示旧版本

**原因**：浏览器缓存或部署未完成

**解决**：
```bash
# 1. 检查服务器上的文件
curl -s http://43.128.11.119/shiju/ | grep -o 'index-[^"]*\.js'

# 2. 检查本地构建
ls -lh apps/web/dist/assets/ | grep index

# 3. 强制重新部署
sudo rsync -av --delete apps/web/dist/ /var/www/shiju/

# 4. 清除浏览器缓存（Ctrl+Shift+R）
```

---

## 完整部署 Checklist

### 后端更新

- [ ] `git pull` 拉取最新代码
- [ ] `pnpm install` 更新依赖（如有变化）
- [ ] 检查 `.env` 配置是否需要更新
- [ ] `systemctl --user restart shiju-api` 重启服务
- [ ] `curl http://localhost:3001/health` 验证服务启动
- [ ] `journalctl --user -u shiju-api -n 20` 检查日志无错误

### 前端更新

- [ ] `git pull` 拉取最新代码
- [ ] `pnpm install` 更新依赖（如有变化）
- [ ] 确认 `apps/web/.env.production` 为 `VITE_API_BASE_URL=/shiju/api`
- [ ] `pnpm --filter @art/web run build:skip-check` 构建前端
- [ ] `sudo rsync -av --delete apps/web/dist/ /var/www/shiju/` 部署
- [ ] `curl -s http://43.128.11.119/shiju/ | grep title` 验证部署
- [ ] `curl -s http://43.128.11.119/shiju/api/health` 验证 API 可访问

### Nginx 配置更新

- [ ] 编辑 `/etc/nginx/sites-available/shiju`
- [ ] `sudo nginx -t` 测试配置
- [ ] `sudo systemctl reload nginx` 重载配置
- [ ] 验证前端和 API 都可访问

---

## 回滚流程

### 后端回滚

```bash
cd ~/ShiJu
git log --oneline -10  # 查看最近的提交
git checkout <commit-hash>
systemctl --user restart shiju-api
```

### 前端回滚

```bash
cd ~/ShiJu
git log --oneline -10  # 查看最近的提交
git checkout <commit-hash>
pnpm --filter @art/web run build:skip-check
sudo rsync -av --delete apps/web/dist/ /var/www/shiju/
```

---

## 监控和日志

### 后端日志

```bash
# 实时查看
journalctl --user -u shiju-api -f

# 查看最近 50 条
journalctl --user -u shiju-api -n 50 --no-pager

# 查看特定时间范围
journalctl --user -u shiju-api --since "2026-07-07 10:00" --until "2026-07-07 11:00"
```

### Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 数据库备份

**自动备份**：每日 2 AM 通过 cron 自动备份，保留 30 天

```bash
# 手动备份
pg_dump shiju > ~/backups/shiju-$(date +%Y%m%d-%H%M%S).sql

# 恢复
psql shiju < ~/backups/shiju-20260707-100000.sql
```

---

## 安全注意事项

1. **环境变量**：`.env` 文件包含敏感信息，不要提交到 git
2. **数据库密码**：定期更换数据库密码
3. **API Key**：定期轮换 AI API Key
4. **HTTPS**：生产环境应配置 HTTPS（待完成）
5. **防火墙**：确保只开放必要的端口（80, 443）

---

## TODO

- [ ] 配置 HTTPS（Let's Encrypt）
- [ ] 添加用户认证系统
- [ ] 设置日志轮转
- [ ] 配置监控告警（API 服务宕机、数据库连接失败）
- [ ] 自动化部署脚本（CI/CD）
