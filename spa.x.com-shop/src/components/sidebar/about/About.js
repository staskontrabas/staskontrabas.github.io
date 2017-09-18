import React from 'react';
import { Link } from 'react-router';

export default class About extends React.Component {
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
      <ul className="list list_ident right-sidebar__list">
        <span className="text text_size_x-small text_color_contrast text_big right-sidebar__title-text">О магазине</span>
        <li className="list__item">
          <Link className="link link_block" to="/delivery">
            <span className="text text_size_x-medium text_color_contrast">Доставка товаров</span>
          </Link>
        </li>
        <li className="list__item">
          <Link className="link link_block" to="/payment-methods">
            <span className="text text_size_x-medium text_color_contrast">Способы оплаты</span>
          </Link>
        </li>
        <li className="list__item">
          <Link className="link link_block" to="/quarantee">
            <span className="text text_size_x-medium text_color_contrast">Гарантия</span>
          </Link>
        </li>
        <li className="list__item">
          <Link className="link link_block" to="/contacts">
            <span className="text text_size_x-medium text_color_contrast">Контакты</span>
          </Link>
        </li>
      </ul>
    );
  }
}