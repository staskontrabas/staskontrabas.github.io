import React from 'react';
import { Link } from 'react-router'; 

export default () => {
  return (
    <div className="footer">
        <div className="footer__contacts-wrapper">
          <div className="layout">
            <div className="layout__col">
              <div className="footer__contacts"><span className="text text_size_small">Для звонков из Москвы и Московской области</span><Link className="footer__contacts-phone" to="tel:+74957999669"><span className="icon icon_phone-blue"></span><span className="text">8 495 799-96-69</span></Link>
              </div>
            </div>
            <div className="layout__col">
              <div className="footer__contacts"><span className="text text_size_small">Для звонков из других регионов РФ, бесплатно</span><Link className="footer__contacts-phone" to="tel:+78002000069"><span className="icon icon_phone-blue"></span><span className="text">8 800 200-00-69</span></Link>
              </div>
            </div>
          </div>
          <p className="footer__callback-text"> <span className="text text_size_small">Не смогли дозвониться? — </span>
            <button className="button footer_callback-link" type="button" data-link="js-modal-1"><span className="text text_size_small">Оставьте заявку на обратный звонок</span>
            </button><br/><span className="text text_size_small">и мы перезвоним Вам в течение 15 минут</span>
          </p>
        </div>
        <div className="footer__controls-wrapper">
          <div className="layout">
            <div className="layout__col">
              <div className="layout">
                <div className="layout__col">
                  <div className="dropdown dropdown_footer-menu"><span className="text text_size_large dropdown__title">О магазине</span><span className="icon icon_chevron-down"></span>
                    <div className="dropdown__content">
                      <ul className="list footer__menu">
                        <li className="list__item list__item_block list__item_border"><Link className="link link_black link_block footer__menu-link" to="/delivery"><span className="text text_size_x-medium">Доставка товаров</span></Link>
                        </li>
                        <li className="list__item list__item_block list__item_border"><Link className="link link_black link_block footer__menu-link" to="/payment-methods"><span className="text text_size_x-medium">Способы оплаты</span></Link>
                        </li>
                        <li className="list__item list__item_block list__item_border"><Link className="link link_black link_block footer__menu-link" to="/quarantee"><span className="text text_size_x-medium">Гарантия</span></Link>
                        </li>
                        <li className="list__item list__item_block list__item_border"><Link className="link link_black link_block footer__menu-link" to="/contacts"><span className="text text_size_x-medium">Контакты</span></Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <ul className="list footer__menu">
                    <li className="list__item list__item_block"><span className="text text_size_large footer__menu-title">О магазине</span>
                    </li>
                    <li className="list__item list__item_block"><Link className="link link_black link_block footer__menu-link" to="/delivery"><span className="text text_size_x-medium">Доставка товаров</span></Link>
                    </li>
                    <li className="list__item list__item_block"><Link className="link link_black link_block footer__menu-link" to="/payment-methods"><span className="text text_size_x-medium">Способы оплаты</span></Link>
                    </li>
                    <li className="list__item list__item_block"><Link className="link link_black link_block footer__menu-link" to="/quarantee"><span className="text text_size_x-medium">Гарантия</span></Link>
                    </li>
                    <li className="list__item list__item_block"><Link className="link link_black link_block footer__menu-link" to="/contacts"> <span className="text text_size_x-medium">Контакты</span></Link>
                    </li>
                  </ul>
                </div>
                <div className="layout__col">
                  <div className="dropdown dropdown_footer-menu"><span className="text text_size_large dropdown__title">Помощь</span><span className="icon icon_chevron-down"></span>
                    <div className="dropdown__content">
                      <ul className="list footer__menu">
                        <li className="list__item list__item_block list__item_border"><Link className="link link_black link_block footer__menu-link" to="/how-order"><span className="text text_size_x-medium">Как сделать заказ</span></Link>
                        </li>
                        <li className="list__item list__item_block list__item_border"><Link className="link link_black link_block footer__menu-link" to="/bonus"><span className="text text_size_x-medium">Бонусные баллы Икском</span></Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <ul className="list footer__menu">
                    <li className="list__item list__item_block"><span className="text text_size_large, footer__menu-title">Помощь</span>
                    </li>
                    <li className="list__item list__item_block"><Link className="link link_black link_block footer__menu-link" to="/how-order"><span className="text text_size_x-medium">Как сделать заказ</span></Link>
                    </li>
                    <li className="list__item list__item_block"><Link className="link link_black link_block footer__menu-link" to="/bonus"><span className="text text_size_x-medium">Бонусные баллы Икском</span></Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="layout__col">
              <div className="footer__store-wrapper">
                <button className="button application_button application_button_appstore footer__store-button" type="button" data-link="#"><span className="icon icon_appstore"></span>
                </button>
                <button className="button application_button application_button_appstore footer__store-button" type="button" data-link="#"><span className="icon icon_google-play"></span>
                </button>
              </div>
              <div className="footer__social-wrapper">
                <p className="footer__social-title"><span className="text text_size_x-medium">Икском шоп в соцсетях</span>
                </p>
                <button className="button social_button social_button_vk" type="button" data-link="#"><span className="icon icon_vk"></span>
                </button>
                <button className="button social_button social_button_facebook" type="button" data-link="#"><span className="icon icon_facebook"></span>
                </button>
                <button className="button social_button social_button_odnoklassniki" type="button" data-link="#"><span className="icon icon_odnoklassniki"></span>
                </button>
                <button className="button social_button social_button_twitter" type="button" data-link="#"><span className="icon icon_twitter"></span>
                </button>
                <button className="button social_button social_button_instagramm" type="button" data-link="#"><span className="icon icon_instagramm"></span>
                </button>
                <button className="button social_button social_button_youtube" type="button" data-link="#"><span className="icon icon_youtube"></span>
                </button>
              </div>
            </div>
          </div>
          <div className="footer__copyright mobile-hidden"><span className="text text_size_small">© 2017 Икском Шоп</span>
          </div>
        </div>
        <button className="button button_size_large button_format_wide to-desktop" type="button" data-link="#"><span className="icon icon_to-desktop"></span><span className="text text_size_large">На основную версию сайта</span>
        </button>
      </div>
  );
}