import React from 'react';
import { Link } from 'react-router';

export default class Basket extends React.Component {
  toggleSidebar() {
    const body = document.querySelector('body');
    let open = false;
    let bodyClass = body.classList;
    for(var i in bodyClass){
      if(bodyClass[i] == 'open'){
        open = true;
      }
    }
    !open ? body.classList.add('open') : body.classList.remove('open');
  }
  render() {
    return (
      <ul className="list right-sidebar__list">
        <li className="list__item list__item_ident">
          <Link className="link right-sidebar__goods-link link_block" to="/basket">
            <span className="icon icon_sidebar-shoping-cart"></span>
            <span className="text text_size_x-medium text_color_contrast">Корзина</span>
            <span className="badge badge_color_white badge_circle text">2</span>
          </Link>
        </li>
        <li className="list__item list__item_ident">
          <Link className="link right-sidebar__goods-link link_block" to="/bookmarks">
            <span className="icon icon_sidebar-favorites"></span>
            <span className="text text_size_x-medium text_color_contrast">Избранные товары</span>
            <span className="badge badge_empty text">2</span>
          </Link>
        </li>
        <li className="list__item list__item_ident">
          <Link className="link right-sidebar__goods-link link_block" to="/compare-list">
            <span className="icon icon_sidebar-compare"></span>
            <span className="text text_size_x-medium text_color_contrast">Сравнение товаров</span>
            <span className="badge badge_empty text">2</span>
          </Link>
        </li>
      </ul>
    );
  }
}