import React from 'react';
import { Link } from 'react-router';
import Auth from '../../sidebar/auth';
import Category from '../../sidebar/category';
import Basket from '../../sidebar/basket';
import About from '../../sidebar/about';

export default class Sidebar extends React.Component {
  render () {
    return (
      <div className="right-sidebar">
        <Auth/>
        <Category/>
        <Basket/>
        <About/>
      </div>
    )
  }
}