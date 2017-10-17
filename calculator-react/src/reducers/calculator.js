import * as actionTypes from '../utils/actionTypes';

const initialAppState = {
  inputStart: false,
  inputValue: '0',
  resultValue: false,
  acts: '',
  stack: '0',
  calculate: false,
  showingResult: false,
  str: '',
  strStack: ''
};


const calculator = (state = initialAppState, action) => {
  if (action.type === actionTypes.INPUT_NUMBER) {
    return {
      ...state,
      calculate: state.acts !== '' ? true : false,
      inputValue: state.inputStart ? state.inputValue + action.number : action.number,
      stack: state.inputStart ? state.inputValue + action.number : action.number,
      inputStart: true,
      showingResult: false
    };
  } else if (action.type === actionTypes.BACK) {
    return {
      ...state,
      inputValue: action.inputValue,
      stack: action.inputValue,
      inputStart: action.inputStart
    };
  }  else if (action.type === actionTypes.OPERATION) {
    return {
      ...state,
      acts: action.acts || state.acts,
      str: action.str,
      strStack: action.strStack,
      stack: action.stack || state.stack,
      inputStart: false,
      calculate: action.calculate,
      inputValue: action.resultValue,
      resultValue: action.resultValue || state.resultValue,
      showingResult: false//state.calculate ? true : false
    };
  } else if (action.type === actionTypes.WIPE) {
    return {
      ...state,
      ...initialAppState
    };
  } else if (action.type === actionTypes.SIGN) {
    return {
      ...state,
      inputValue: (parseFloat(state.inputValue) * (-1)).toString(),
      resultValue: state.showingResult ? (parseFloat(state.resultValue) * (-1)).toString(): state.resultValue
    };
  } else if (action.type === actionTypes.CLEAR) {
    return {
      ...state,
      inputValue: '0',
      resultValue: action.resultValue,
      inputStart: false,
      showingResult: false
    };
  } else if (action.type === actionTypes.EQUAL) {
    return {
      ...state,
      acts: action.acts,
      calculate: false,
      str: '',
      strStack: '',
      inputStart: false,
      inputValue: action.resultValue,
      resultValue: action.resultValue,
      showingResult: true
    };
  } else {
    return state;
  }
};

export default calculator;
