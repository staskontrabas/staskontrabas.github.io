import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as pageActions from '../../actions/PageActions';
import axios from 'axios';
import OwlCarousel from 'react-owl-carousel2';
import "./owl.carousel.css";
const data = require('../../static/json/news.json');


export const Tabs = ({content}) => {
    return (
      <div className="tabs">
        <div className="tab__item tab__item_active">
        {content}
        </div>
      </div>
    );
}

export const CatAct = () => {
  return (
    <div className="layout layout_ident">
      <div className="layout__col layout__col_ident_right">
        <Link to='/catalog' className="link button button_size_large button_catalog button_text_directions-left">
          <span className="icon icon_catalog" />
          Каталог товаров
          <span className="icon icon_chevron-white icon_directions-right" />
        </Link>
      </div>
      <div className="layout__col layout__col_ident_left">
        <Link to='/actions' className="link button button_size_large button_actions button_text_directions-left">
          Акции и спецпредложения
          <span className="icon icon_chevron icon_directions-right" />
        </Link>
      </div>
    </div>
  )
}

export const Content = ({content, room, setRoom}) => {
    return (
      <div className="content">
        <RoomBtn room={room} setRoom={setRoom}/>
        <Tabs content={content} room={room}/>
      </div>
    );
}
class RoomBtn extends React.Component {
  onRoomBtnClick(e){
    this.props.setRoom(e.target.getAttribute("data-room"));
    console.log(e.target.getAttribute("data-room"));
  }
  render() {
    return (
      <div className="radio-group radio-group_home radio-group_align-center radio-group_ident">
        <label className="radio">
          <input className="radio radio__input" data-link="js-tab-1" name="group" type="radio" defaultChecked="true"/>
          <span className="radio__text" data-room="shop" onClick={this.onRoomBtnClick.bind(this)}>Для офиса</span>
        </label>
        <label className="radio">
          <input className="radio radio__input" data-link="js-tab-2" name="group" type="radio" />
          <span className="radio__text" data-room="dom" onClick={this.onRoomBtnClick.bind(this)}>Для дома</span>
        </label>
      </div>
    );
  }
}

/*
RoomBtn.propTypes = {
  room: PropTypes.string.isRequired
}*/

const options1 = {
    items: 1,
    rewind: true,
    lazyLoad:true,
    dots: true
};
export class BannerCarousel extends React.Component {
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  render() {
    //<div className="carousel last-articles-list" data-options='{"autoWidth":true,"dots":false}'>
    return (
      <OwlCarousel ref="car1" options={options1}>
        <a href="#">
          <img
            alt=""
            className="carousel__lazy"
            src="static/img/main-banner_01.png"
            data-src="static/img/main-banner_01.png"
            data-src-retina="static/img/main-banner_01.png"
          />
        </a>
        <a href="#">
          <img
            alt=""
            className="carousel__lazy"
            src="static/img/main-banner_01.png"
            data-src="static/img/main-banner_01.png"
            data-src-retina="static/img/main-banner_01.png"
          />
        </a>
        <a href="#">
          <img
            alt=""
            className="carousel__lazy"
            src="static/img/main-banner_01.png"
            data-src="static/img/main-banner_01.png"
            data-src-retina="static/img/main-banner_01.png"
          />
        </a>
        <a href="#">
          <img
            alt=""
            className="carousel__lazy"
            src="static/img/main-banner_01.png"
            data-src="static/img/main-banner_01.png"
            data-src-retina="static/img/main-banner_01.png"
          />
        </a>
      </OwlCarousel>
    );
  }
}

