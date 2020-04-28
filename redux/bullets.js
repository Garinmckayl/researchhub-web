import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import { doesNotExist } from "~/config/utils";
/**********************************
 *        ACTIONS SECTION         *
 **********************************/

export const BulletsConstants = {
  FETCH_BULLETS: "@@BULLETS/FETCH_BULLETS",
  FETCH_SUCCESS: "@@BULLETS/FETCH_SUCCESS",
  FETCH_FAILURE: "@@BULLETS/FETCH_FAILURE",
  POST_BULLET: "@@BULLETS/POST_BULLET",
  POST_SUCCESS: "@@BULLETS/POST_SUCCESS",
  POST_FAILURE: "@@BULLETS/POST_FAILURE",
  REORDER_BULLETS: "@@BULLETS/REORDER_BULLETS",
  REORDER_SUCCESS: "@@BULLETS/REORDER_SUCCESS",
  REORDER_FAILURE: "@@BULLETS/REORDER_FAILURE",
};

const BULLET_COUNT = 5;

export const BulletActions = {
  getBullets: (paperId) => {
    return (dispatch) => {
      dispatch({
        type: BulletsConstants.FETCH_BULLETS,
        payload: { pending: true, success: false },
      });
      return fetch(
        API.BULLET_POINT({
          paperId,
          ordinal__isnull: false,
          type: "KEY_TAKEAWAY",
        }),
        API.GET_CONFIG()
      )
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((res) => {
          return dispatch({
            type: BulletsConstants.FETCH_SUCCESS,
            payload: {
              bullets: res.results,
              pending: false,
              success: true,
            },
          });
        })
        .catch((err) => {
          return dispatch({
            type: BulletsConstants.FETCH_FAILURE,
            payload: {
              pending: false,
              success: false,
            },
          });
        });
    };
  },
  postBullet: ({ paperId, bullet, prevState }) => {
    return (dispatch) => {
      dispatch({
        type: BulletsConstants.POST_BULLET,
        payload: { pending: true, success: false },
      });
      return fetch(API.BULLET_POINT({ paperId }), API.POST_CONFIG(bullet))
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((res) => {
          let newBullet = res;
          let bullets = [...prevState.bullets, res];

          return dispatch({
            type: BulletsConstants.POST_SUCCESS,
            payload: {
              bullets,
              newBullet,
              pending: false,
              success: true,
            },
          });
        })
        .catch((err) => {
          console.log("err", err);
          return dispatch({
            type: BulletsConstants.POST_FAILURE,
            payload: {
              pending: false,
              success: false,
            },
          });
        });
    };
  },
  reorderBullets: ({ bullets, paperId }) => {
    return (dispatch) => {
      dispatch({
        type: BulletsConstants.REORDER_BULLETS,
        payload: { pending: true, success: false },
      });
      let order = [];
      for (let i = 0; i < bullets.length; i++) {
        order.push(bullets[i].id);
      }
      let params = {
        order,
        bullet_type: "KEY_TAKEAWAY",
      };
      return fetch(API.REORDER_BULLETS(), API.PATCH_CONFIG(params))
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((res) => {
          return dispatch({
            type: BulletsConstants.REORDER_SUCCESS,
            payload: {
              bullets: bullets,
              pending: false,
              success: true,
            },
          });
        })
        .catch((err) => {
          return dispatch({
            type: BulletsConstants.REORDER_FAILURE,
            payload: {
              pending: false,
              success: false,
            },
          });
        });
    };
  },
};

/**********************************
 *        REDUCER SECTION         *
 **********************************/

const defaultBulletsState = {
  bullets: [],
  allBullets: [],
  newBullet: null,
};

const BulletsReducer = (state = defaultBulletsState, action) => {
  switch (action.type) {
    case BulletsConstants.FETCH_BULLETS:
    case BulletsConstants.FETCH_FAILURE:
    case BulletsConstants.FETCH_SUCCESS:
    case BulletsConstants.POST_BULLET:
    case BulletsConstants.POST_SUCCESS:
    case BulletsConstants.POST_FAILURE:
    case BulletsConstants.REORDER_BULLETS:
    case BulletsConstants.REORDER_SUCCESS:
    case BulletsConstants.REORDER_FAILURE:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default BulletsReducer;
