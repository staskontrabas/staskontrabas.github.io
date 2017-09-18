import React from 'react';
import { Link } from 'react-router';

export default class Category extends React.Component {
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
      <ul className="list list_ident right-sidebar__list right-sidebar__list_category">
        <li className="list__item">
          <Link className="link link_block" to="/catalog" onClick={this.toggleSidebar}>
            <span className="text text_size_xx-large text_color_contrast">Каталог товаров</span>
          </Link>
        </li>
        <li className="list__item">
          <Link className="link link_block" to="/actions" onClick={this.toggleSidebar}>
            <span className="text text_size_xx-large text_color_contrast">Акции и спецпредложения</span>
          </Link>
        </li>
        <li className="list__item">
          <Link className="link link_block" to="/news" onClick={this.toggleSidebar}>
            <span className="text text_size_xx-large text_color_contrast">Новости</span>
          </Link>
        </li>
        <li className="list__item">
          <Link className="link link_block" to="/bonus" onClick={this.toggleSidebar}>
            <span className="text text_size_xx-large text_color_contrast">Бонусные баллы</span>
          </Link>
        </li>
      </ul>
    );
  }
}