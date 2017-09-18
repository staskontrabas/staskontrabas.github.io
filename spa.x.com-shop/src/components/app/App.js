import React from 'react';
import { Link } from 'react-router';
import { Content } from '../../components/common/common.js';
import Sidebar from '../../components/sidebar/sidebar';
import Footer from '../../components/footer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as pageActions from '../../actions/PageActions';

class Header extends React.Component {
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
    <div className="header">
      <Link className="header__menu" onClick={this.toggleSidebar}>
        <span className="icon icon_gamburger" />
      </Link>
      <Link className="header__logo" to='/'>
        <span className="icon icon_xcom-logo" />
      </Link>
      <div className="header__right-menu">
        <Link className="header__search" data-type="open-search">
          <span className="icon icon_header-search" />
        </Link>
        <Link className="header__cart" to="/basket">
          <span className="icon icon_shoping-cart" />
          <span className="badge badge_type_danger badge_absolute badge_pos_top-right">2</span>
        </Link>
      </div>
    </div>
    );
  }
}

const BreadcrumbsItem = ({path, name}) => (
  <span>
    <Link to={path}>{name}</Link>
    <span className='icon icon_breadcrumbs-delimeter'></span>
  </span>
);

const Breadcrumbs = ({routes}) => {  
  let path = '';
  return (
    <div className='breadcrumbs'>
      <div className='breadcrumbs__wrap'>
        {routes.map((route, i) => (
          route.path && route.name && <BreadcrumbsItem key={i} path={i > 1 ? path += '/' + route.path : path += route.path} name={route.name} />
        )
      )}
      </div>
    </div>
  );
};


export const NewsDetail = () => {
  return (
    <div className="news-detail">
      <div className="layout layout_ident">
        <span>16 января 2017</span>
        <h1>NEC PA302W-SV2: 30-дюймовый монитор для профессионалов</h1>
        <p>
          Новый профессиональный монитор NEC PA302W-SV2 оснащен 10-битной панелью AH-IPS и светодиодной подсветкой GB-R. По данным производителя, устройство сочетает в себе высокую надежность, бескомпромиссное качество изображения, а также очень точное цветовоспроизведение. Дисплей готов работать в режиме 24 / 7 (с возможностью продления гарантийного обслуживания) и гарантирует безошибочное интенсивное визуальное отображение.
        </p>
        <img alt="" src="static/img/news-detail_01.jpg" />
        <b>Монитор 30 NEC PA302W-SV2</b>
        <p>
          В комплект поставки включено программное обеспечение SpectraView II. Оно функционирует в привязке к интегрированной функции SpectraView Engine и опциональным внешним сенсором для обеспечения идеальной аппаратной калибровки с реальными цветовыми оттенками. Благодаря датчику внешней освещенности и счетчику уровня выбросов углекислого газа данный дисплей обеспечивает профессиональную и в то же время экологичную эффективность и оказывает меньшее воздействие на окружающую среду на протяжении всего срока службы.
        </p>
        <p>
          NEC PA302W-SV2 создан для для работы с претенциозными приложениями, для творческих профессионалов, дизайнеров, фотографов, для работы с САПР/АПП, для специалистов по видеомонтажу, для финансовой сферы, инженеров-метрологов, а также для демонстрации медицинских изображений, для телевещания и промышленных приложений (например, NTD) и для всех тех, кто ценит качество визуальной работы. Прецизионную передачу деталей и цветов обеспечивает 10-битная матрица IPS и цифровой контроль равномерности Digital Uniformity Control. Также не обошлось без 14-битной аппаратной таблицы пересчета цветов.
        </p>
        <img alt="" src="static/img/news-detail_02.jpg" />
        <b>Монитор 30 NEC PA302W-SV2</b>
        <p>
          Монитор NEC PA302W-SV2 позволяет осуществлять мгновенную визуализацию в реальном времени. Он поддерживает раздельную эмуляцию цветового пространства с помощью трехмерной таблицы пересчета цветов 3D LUT и функцию картинка-в-картинке. Можно добиться точной имитации различных световых условий в зависимости от цвета бумаги.
        </p>
      </div>
    </div>
  );
}

class App extends React.Component {
  render() {
    console.log(this.props);
    const { room } = this.props;
    const { setRoom } = this.props.pageActions;
    return (
      <div>
        <Sidebar/>
        <div className="page">
          <Header/>
          <Breadcrumbs routes={this.props.routes} />
          <Content content={this.props.children} setRoom={setRoom} room={room}/>
          <Footer/>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    room: state.room
  }
}

function mapDispatchToProps(dispatch) {
  return {
    pageActions: bindActionCreators(pageActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)



/*
const userResolver = resolver(key(':userId')).then((_, keyValue) => userlist
    .filter((u) => u.id === keyValue)[0]
    .name
);

const itemResolver = resolver(key(':item1'), childOf(pathname('RouteName1'), path('parent')))
    .then((_, keyValue) => keyValue.toUpperCase());

const customResolver = (keyValue, text) => {
    if (keyValue === ':item2') {
        return `${keyValue}/${text}`;
    }
    return undefined;
};

const crumbResolver = combineResolvers(userResolver, itemResolver, customResolver, textResolver);

export const App = ({ routes, params, children }) => (
    <div className="animated fadeIn">
        <div>
            <Breadcrumbs routes={routes} params={params} createSeparator=" | " />
            <Breadcrumbs routes={routes} params={params} resolver={crumbResolver} />
            <div className="content">
                <h3>Navigation</h3>
                Users route: <Link to="users">Users</Link>
                <hr />
                Very long route: <Link to="/parent">Parent</Link>{" "}
                <Link to="/parent/child1">Child1</Link>{" "}
                <Link to="/parent/child1/item1">Item1</Link>{" "}
                <Link to="/parent/child1/item1/child2">Child2</Link>{" "}
                <Link to="/parent/child1/item1/child2/item2">Item2</Link>{" "}
                <Link to="/parent/child1/item1/child2/item2/child3">Child3</Link>{" "}
                <br />
                Second very long route: <Link to="/parent-2">Parent-2</Link>{" "}
                <Link to="/parent-2/child1">Child1-2</Link>{" "}
                <Link to="/parent-2/child1/item1">Item1-2</Link>{" "}
                <Link to="/parent-2/child1/item1/child2">Child2-2</Link>{" "}
                <Link to="/parent-2/child1/item1/child2/item2">Item2-2</Link>{" "}
                <Link to="/parent-2/child1/item1/child2/item2/child3">Child3-2</Link>{" "}

                <h3>Deeplink</h3>
                <Link to="/context/publishers">Publishers</Link>{" "}
                <Link to="/context/publishers/myId">Publishers</Link>
                <h3>Content</h3>
                {children}
            </div>
        </div>
    </div>
);

export const Info = () => (
    <div>
        <div>
            The breadcrumbs will use the route names for non-dynamic
            routes or the parameter value for :item1 and :item2.
        </div>
    </div>
);

export const NoMatch = () => (
    <div>
        <div>
            <Breadcrumbs routes={this.props.routes}/>
        </div>
    </div>
);

export class UserDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = { user: { id: 0, name: '', img: '' } };
    }

    componentDidMount() {
        this.setUserState();
    }

    componentWillUpdate(nextProps) {
        if (this.state.user.id !== nextProps.params.userId) {
            this.setUserState();
        }
    }

    setUserState() {
        this.setState({
            user: this.findUserById(this.props.params.userId)[0]
        });
    }

    findUserById(id) {
        return userlist.filter((item) => item.id === id);
    }

    render() {
        return (
            <div>
                <div>
                    <hr />
                    This is what we know:
                    <br />ID: {this.state.user.id}
                    <br />NAME: {this.state.user.name}
                </div>
            </div>
        );
    }
}

export class UserImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { user: { id: 0, name: '', img: '' } };
    }

    componentDidMount() {
        this.setUserState();
    }

    componentWillUpdate(nextProps) {
        if (this.state.user.id !== nextProps.params.userId) {
            this.setUserState();
        }
    }

    setUserState() {
        this.setState({
            user: this.findUserById(this.props.params.userId)[0]
        });
    }

    findUserById(id) {
        return userlist.filter((item) => item.id === id);
    }

    render() {
        return (
            <div>
                <div>
                    <hr />
                    This is what we know:
                    <img src={this.state.user.img} alt="Rambo"/>
                </div>
            </div>
        );
    }
}


export class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = { users: userlist };
    }

    componentWillMount() {
        if ('users' in this.props) {
            this.setState({ users: this.props.users });
        }
    }

    render() {
        return (
            <div>
                <h1>User List</h1>
                <div className="master">
                    <ul>
                        {this.state.users // eslint-disable-line newline-per-chained-call
                            .map((user) => (
                                <li key={user.id}><Link to={`/users/${user.id}`}>{user.name}</Link></li>
                            ))}
                    </ul>
                </div>
                <div className="detail">

                    {this.props.children}
                </div>
            </div>
        );
    }
}

export const User = (props) => (
    <div>
        <hr />
        You're one click away from learning everything we know
        about user no {props.params.userId}.<br />
        Click{" "}<strong>
        <Link to={`/users/${props.params.userId}/details`}>here</Link></strong> for more details.
        <Link to={`/users/${props.params.userId}/image`}>Images here</Link>
        <br />
        {props.children}
    </div>
);
export const PublishersPage = ({params}) => (
    <div>
        <h1>PublishersPage</h1>
        <span>{JSON.stringify(params)}</span>
    </div>
);
export const PublisherPageContainer = ({params}) => (
    <div>
        <h1>PublisherPageContainer</h1>
        <span>{JSON.stringify(params)}</span>
    </div>
);
*/