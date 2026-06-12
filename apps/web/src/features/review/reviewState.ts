import { applyReviewFeedback, type ExpressionSense, type ReadingFeedback, type ReviewFeedback } from "@art/domain";

export interface ReviewState {
  expressions: ExpressionSense[];
  activeReviewIds?: string[];
}

type ReviewAction =
  | {
      source: "reading";
      expressionSenseId: string;
      feedback: Exclude<ReadingFeedback, "add_to_review">;
      at: string;
    }
  | {
      source: "review";
      expressionSenseId: string;
      feedback: ReviewFeedback;
      at: string;
    }
  | {
      source: "reading";
      expressionSenseId: string;
      feedback: "add_to_review";
      at: string;
    };

export function applyReviewAction(state: ReviewState, action: ReviewAction): ReviewState {
  if (action.source === "reading" && action.feedback !== "add_to_review") {
    return state;
  }

  if (action.source === "reading" && action.feedback === "add_to_review") {
    const activeReviewIds = new Set(state.activeReviewIds ?? []);
    activeReviewIds.add(action.expressionSenseId);
    return { ...state, activeReviewIds: [...activeReviewIds] };
  }

  return {
    ...state,
    expressions: state.expressions.map((expression) =>
      expression.id === action.expressionSenseId
        ? applyReviewFeedback(expression, action.feedback, action.at).next
        : expression
    )
  };
}
