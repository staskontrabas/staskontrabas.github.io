import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../actions';

import "./main.css"

class Calculator extends Component {
  render() {
    const { calculator, actions } = this.props;
    return (
      <div className="container">
        <div className="input-box">
          <div className="input-note" id="input-note">{calculator.str}</div>
  <input value={calculator.showingResult ? calculator.resultValue : calculator.inputValue} id="input" readOnly="true" />
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('7')} >7</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('8')}>8</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('9')}>9</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.division}>/</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.back}>←</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('4')}>4</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('5')}>5</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('6')}>6</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.multiple}>*</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.clear}>CE</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('1')}>1</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('2')}>2</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('3')}>3</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.minus}>-</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.wipe}>C</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={() => actions.print('0')}>0</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.dot}>.</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell">±</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.plus}>+</div>
          </div>
        </div>
        <div className="btn">
          <div className="btn-table">
             <div className="btn-cell" onClick={actions.equal}>=</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state, ownProps) => ({
  calculator: state.calculator,
});

function mapDispatch(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  }
}

export default connect(mapState, mapDispatch)(Calculator);
