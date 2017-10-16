import * as actionTypes from '../utils/actionTypes';

export const print = (number) => ({
  type: actionTypes.INPUT_NUMBER,
  number
});

export const calculateMe = (type, calc) => {
  calc.inputValue = type === actionTypes.EQUAL ? calc.stack : calc.inputValue;
  switch(calc.acts){
    case actionTypes.PLUS:
      calc.resultValue = (parseFloat(calc.resultValue) + (parseFloat(calc.inputValue))).toString();
      break;
    case actionTypes.MINUS:
      calc.resultValue = (parseFloat(calc.resultValue) - (parseFloat(calc.inputValue))).toString();
      break;
    case actionTypes.MULTIPLE:
      calc.resultValue = (parseFloat(calc.resultValue) * (parseFloat(calc.inputValue))).toString();
      calc.str += calc.strStack;
      calc.strStack = calc.inputValue + ' * ';
      break;
    case actionTypes.DIVISION:
      calc.resultValue = (parseFloat(calc.resultValue) / (parseFloat(calc.inputValue))).toString();
      calc.str += calc.strStack;
      calc.strStack = calc.inputValue + ' / ';
      break;
    default:
      break;
  }
  
  return {
    type: type === actionTypes.EQUAL ? actionTypes.EQUAL : actionTypes.OPERATION,
    calculate: false,//type === actionTypes.EQUAL ? true : false,
    acts: calc.acts,
    str: calc.str + calc.inputValue + ' ' + type + ' ',
    strStack: calc.str,
    resultValue: calc.resultValue
  }
}
 
export const back = () => {
  return (dispatch, getState) => {
    const calc = getState().calculator;
    if(!calc.showingResult){
      if(!calc.inputValue.length || calc.inputValue.length === 1){
        calc.inputValue = '0';
        calc.inputStart = false;
      }
      else{
        calc.inputValue = calc.inputValue.slice(0, -1);
      }
    }
    return dispatch({
      type: actionTypes.BACK,
      inputValue: calc.inputValue,
      inputStart: calc.inputStart
    });
  }
}

export function dot(){
  return (dispatch, getState) => {
    const calc = getState().calculator;
    if(calc.inputValue.indexOf('.') !== -1){
      return false;
    }
    else{
      return dispatch(print('.'));
    }
  }
}

export function plus(){
  return (dispatch, getState) => {
    const calc = getState().calculator;console.log(calc.inputValue.indexOf('.'), calc.inputValue.length - 1);
    if(calc.inputValue.indexOf('.') === calc.inputValue.length - 1){
      calc.inputValue = calc.inputValue.slice(0, -1);
    }
    if(!calc.calculate){
      return dispatch({
        type: actionTypes.OPERATION,
        acts: actionTypes.PLUS,
        calculate: false,
        str: calc.strStack + calc.inputValue + ' + ',
        strStack: calc.strStack,
        stack: calc.inputValue,
        resultValue: !calc.resultValue ? calc.inputValue : calc.resultValue
      });
    }
    else{
      return dispatch(calculateMe('+', calc));
    }
  }
};

export function minus(){
  return (dispatch, getState) => {
    const calc = getState().calculator;
    if(!calc.calculate){
      return dispatch({
        type: actionTypes.OPERATION,
        acts: actionTypes.MINUS,
        calculate: false,
        str: calc.strStack + calc.inputValue + ' - ',
        strStack: calc.strStack,
        stack: calc.inputValue,
        resultValue: !calc.resultValue ? calc.inputValue : calc.resultValue
      });
    }
    else{
      return dispatch(calculateMe('-', calc));
    }
  }
};
export function division(){
  return (dispatch, getState) => {
    const calc = getState().calculator;
    if(!calc.calculate){
      return dispatch({
        type: actionTypes.OPERATION,
        acts: actionTypes.DIVISION,
        calculate: false,
        str: calc.strStack + calc.inputValue + ' / ',
        strStack: calc.strStack,
        stack: calc.inputValue,
        resultValue: !calc.resultValue ? calc.inputValue : calc.resultValue
      });
    }
    else{
      return dispatch(calculateMe('/', calc));
    }
  }
};
export function multiple(){
  return (dispatch, getState) => {
    const calc = getState().calculator;
    if(!calc.calculate){
      return dispatch({
        type: actionTypes.OPERATION,
        acts: actionTypes.MULTIPLE,
        calculate: false,
        str: calc.strStack + calc.inputValue + ' * ',
        strStack: calc.strStack,
        stack: calc.inputValue,
        resultValue: !calc.resultValue ? calc.inputValue : calc.resultValue
      });
    }
    else{
      return dispatch(calculateMe('*', calc));
    }
  }
};

export const equal = () => {
  return (dispatch, getState) => {
    const calc = getState().calculator;
    return dispatch(calculateMe(actionTypes.EQUAL, calc));
  }
};
export const clear = () => {
  return (dispatch, getState) => {
    const calc = getState().calculator;
    if(calc.showingResult){
      calc.resultValue = '0';
      calc.inputValue = '0'
    }
    else{
      calc.inputValue = '0';
    }
    return dispatch({
      type: actionTypes.CLEAR,
      resultValue: calc.resultValue,
      inputValue: calc.inputValue
    });
  }
};

export const wipe = () => ({
  type: actionTypes.WIPE
});
