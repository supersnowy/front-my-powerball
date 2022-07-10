import React from 'react';
import { FormattedMessage } from 'react-intl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as AppActions from '../../actions/app'
import { connect } from 'react-redux'

class Results extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rounds: [],
      isActive: null
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.rounds !== prevProps.rounds && this.props.rounds.length > 0) {
      this.setState({ rounds: this.props.rounds })
    }

    if (this.props.isActive !== prevProps.isActive) {
      this.setState({ isActive: this.props.isActive })
    }
  }

  getBallClassName(ball) {
    if (ball >= 0 && ball < 8) {
      return "d-flex align-items-center justify-content-center ball yellow"
    }
    if (ball > 7 && ball < 15) {
      return "d-flex align-items-center justify-content-center ball blue"
    }
    if (ball > 14 && ball < 23) {
      return "d-flex align-items-center justify-content-center ball red"
    }
    if (ball > 22 && ball < 29) {
      return "d-flex align-items-center justify-content-center ball green"
    }

    return "d-flex align-items-center justify-content-center ball black text-black"
  }

  render() {
    var rounds = this.state.rounds
    return <Col className={this.state.isActive === null || this.state.isActive === "none" ? "results-container" : this.state.isActive==="results"? "results-container activeTab":"d-none"} xs={12}>
      <Row>
        <Col className="text-left subtitle bg-dark markets-title">
          <Row className="w-100 m-0">
            <Col xs={11} lg={12} className="p-0"><FormattedMessage id="app.results"
              defaultMessage="Results" /></Col>
            <Col xs={1} className="p-0 text-center closeTab"><span onClick={() => this.props.dispatch(AppActions.changeTab("none"))}>+</span></Col>
          </Row>
        </Col>
      </Row>

      {
        rounds.map((round) => {
          return <Row key={"round_" + round.powerballRoundId} className="result-container">
            <Col xs={3} className="d-flex align-items-center text-left round-result">
              {round.powerballRoundId}
            </Col>
            <Col>
              <Row className="justify-content-between">
                {
                  round.numbers.map((number) => {
                    return <Col key={"num_" + number} xs={1}>
                      <div className={this.getBallClassName(number)}>
                        {number}
                      </div>
                    </Col>
                  })
                }
                 {/* className="ball-container" */}
                 {/* className="ball-container" */}
                <Col xs={1}>
                  <div className="d-flex align-items-center justify-content-center ball black">
                    {round.powerball}
                  </div>
                </Col>
                <Col xs={1}>
                </Col>
              </Row>
            </Col>
          </Row>
        })
      }
    </Col>
  }
}


const mapStateToProps = state => ({
  activeTab: state.appReducer.activeTab
})

export default connect(mapStateToProps)(Results)