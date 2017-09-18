import React from 'react';
import { connect } from 'react-redux';
import News from '../../components/news';
import { CatAct, BannerCarousel } from '../../components/common/common.js';

class Main extends React.Component {
  render() {
    console.log('main',this.props);
    return (
      <div>
          <BannerCarousel/>
          <CatAct/>
          <News/>
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  room: state.room
})

export default connect(mapStateToProps)(Main);