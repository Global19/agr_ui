import { fromJS } from 'immutable';
import {
  FETCH_SUMMARY,
  FETCH_SUMMARY_FAILURE,
  FETCH_SUMMARY_SUCCESS,
  FETCH_DISEASE,
  FETCH_DISEASE_SUCCESS,
  FETCH_DISEASE_FAILURE,
  FETCH_ASSOCIATIONS,
  FETCH_ASSOCIATIONS_SUCCESS,
  FETCH_ASSOCIATIONS_FAILURE,
} from '../actions/disease';

export const DEFAULT_STATE = fromJS({
  summaries : {},
  data: null,
  error: null,
  loading: false,
  associations: {
    data: [],
    loading: false,
    error: null,
    total: 0,
  },
});

const diseaseReducer = function (state = DEFAULT_STATE, action) {
  switch(action.type) {
  case FETCH_SUMMARY:
    return state
      .setIn(['summaries', action.id, 'loading'], true);

  case FETCH_SUMMARY_SUCCESS:
    return state
      .setIn(['summaries', action.id, 'loading'], false)
      .setIn(['summaries', action.id, 'data'], action.summary)
      .setIn(['summaries', action.id, 'error'], null);

  case FETCH_SUMMARY_FAILURE:
    return state
      .setIn(['summaries', action.id, 'loading'], false)
      .setIn(['summaries', action.id, 'data'], null)
      .setIn(['summaries', action.id, 'error'], action.error);

  case FETCH_DISEASE:
    return state.set('loading', true);

  case FETCH_DISEASE_SUCCESS:
    return state.set('loading', false)
      .set('data', action.payload)
      .set('error', null);

  case FETCH_DISEASE_FAILURE:
    return state.set('loading', false)
      .set('data', null)
      .set('error', action.payload);

  case FETCH_ASSOCIATIONS:
    return state.setIn(['associations', 'loading'], true);

  case FETCH_ASSOCIATIONS_SUCCESS:
    return state.setIn(['associations', 'loading'], false)
      .setIn(['associations', 'data'], action.payload.results)
      .setIn(['associations', 'total'], action.payload.total)
      .setIn(['associations', 'error'], null);

  case FETCH_ASSOCIATIONS_FAILURE:
    return state.setIn(['associations', 'loading'], false)
      .setIn(['associations', 'data'], [])
      .setIn(['associations', 'total'], 0)
      .setIn(['associations', 'error'], action.payload);

  default:
    return state;
  }
};

export default diseaseReducer;
