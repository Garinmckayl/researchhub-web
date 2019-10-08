import * as types from "./types";

export const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.FETCH_THREAD_PENDING:
    case types.FETCH_THREAD_FAILURE:
    case types.FETCH_THREAD_SUCCESS:
    case types.POST_COMMENT_PENDING:
    case types.POST_COMMENT_FAILURE:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_REPLY_PENDING:
    case types.POST_REPLY_FAILURE:
    case types.POST_REPLY_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    case types.FETCH_COMMENTS_PENDING:
    case types.FETCH_COMMENTS_FAILURE:
    case types.FETCH_COMMENTS_SUCCESS:
      return {
        ...state,
        commentPage: { ...action.payload },
      };

    case types.FETCH_REPLIES_PENDING:
    case types.FETCH_REPLIES_FAILURE:
      return {
        ...state,
        replyPage: { ...action.payload },
      };
    case types.FETCH_REPLIES_SUCCESS:
      return {
        ...state,
        replyPage: {
          doneFetching: action.payload.doneFetching,
          success: action.payload.success,
        },
        [`comment_${action.payload.comment}_replyPage`]: { ...action.payload },
      };

    default:
      return state;
  }
}
