import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FormattedMessage } from 'react-intl';
import moment from 'moment'

import Countdown from 'react-countdown';

export default class Draw extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            revealFirstNumber: 'd-none',
            revealSecondNumber: 'd-none',
            revealThirdNumber: 'd-none',
            revealFourthNumber: 'd-none',
            revealFifthNumber: 'd-none',
            revealPowerball: 'd-none',
            nextRound: null,
            nextRoundId: '',
            winningNumbers: [],
            count: '',
            nextRoundTime: '',
            roundMsg: {},
            resultAnime: false
        }
    }

    componentDidMount() {
        //this.handleStart()
    }

    componentDidUpdate(prevProps) {
        if (this.props.nextRoundId !== prevProps.nextRoundId) {
            this.setState({
                nextRoundId: this.props.nextRoundId,

            })

        }

        if (this.props.roundMessage !== prevProps.roundMessage) {
            this.setState({
                roundMsg: this.props.roundMessage
            })

            if (this.props.roundMessage.operationType === 1 && this.props.roundMessage.content.status === 3) {
                this.setState({ winningNumbers: [...this.props.roundMessage.content.numbers, this.props.roundMessage.content.powerball], resultAnime: true })
                this.startAnime();
            }
        }

        if (this.props.nextRoundTime !== prevProps.nextRoundTime) {
            this.setState({
                nextRoundTime: this.props.nextRoundTime
            })
        }
    }

    handleStart = () => {
        this.timer = setInterval(() => {
            if (this.state.nextRoundTime !== '') {
                const next = this.state.nextRoundTime
                const newCount = this.calculateTime(next);
                this.setState({ count: newCount })
            }
        }, 1000)
    }

    startAnime() {
        // setTimeout(() => {
        //     this.setState({ revealFirstNumber: 'd-flex' })
        // }, 1000)

        // setTimeout(() => {
        //     this.setState({ revealSecondNumber: 'd-flex' })
        // }, 2000)

        // setTimeout(() => {
        //     this.setState({ revealThirdNumber: 'd-flex' })
        // }, 3000)

        // setTimeout(() => {
        //     this.setState({ revealFourthNumber: 'd-flex' })
        // }, 4000)

        // setTimeout(() => {
        //     this.setState({ revealFifthNumber: 'd-flex' })
        // }, 5000)

        // setTimeout(() => {
        //     this.setState({ revealPowerball: 'd-flex' })
        // }, 6000)

        this.setState({
            revealFirstNumber: 'd-flex',
            revealSecondNumber: 'd-flex',
            revealThirdNumber: 'd-flex',
            revealFourthNumber: 'd-flex',
            revealFifthNumber: 'd-flex',
            revealPowerball: 'd-flex'
        })

        setTimeout(() => {
            this.setState({
                revealFirstNumber: 'd-none',
                revealSecondNumber: 'd-none',
                revealThirdNumber: 'd-none',
                revealFourthNumber: 'd-none',
                revealFifthNumber: 'd-none',
                revealPowerball: 'd-none',
                resultAnime: false
            })
        }, 13500)

    }

    calculateTime(time) {
        var curr = moment(new Date()).utc();
        var duration = moment.utc(moment(time, "DD/MM/YYYY HH:mm:ss").diff(moment(curr, "DD/MM/YYYY HH:mm:ss"))).format("mm:ss")

        return duration;
    }

    getBallClassName(ball) {
        if (ball >= 0 && ball < 8) {
            return "ball yellow-zoom bzoom"
        }
        if (ball > 7 && ball < 15) {
            return "ball blue-zoom bzoom"
        }
        if (ball > 14 && ball < 23) {
            return "ball red-zoom bzoom"
        }
        if (ball > 22 && ball < 29) {
            return "ball green-zoom bzoom"
        }
        return "ball black-zoom text-black bzoom"
    }

    render() {
        let main = null;
        const search = window.location.search;
        const params = new URLSearchParams(search);
        var lang = params.get('language')
        if (lang === null) {
            lang = "en";
        }
        else {
            lang = lang.substring(0, 2);
        }

        if (this.state.nextRoundTime !== '') {
            main = this.state.count[0] > 0 ? <span><FormattedMessage id="app.ongoing"
                defaultMessage="Ongoing" /><span className="bullets">.</span><span className="bullets">.</span><span className="bullets">.</span></span> : <span className={lang==="ko"?"kr-starts":""}><FormattedMessage id="app.starts"
                    defaultMessage="Starts In" /><span className={lang==="ko"?"sub-highlight-kr":"sub-highlight"}><Countdown daysInHours={true} date={new Date(this.state.nextRoundTime)} /></span></span>
        }

        return <Col xs={12} className="d-flex d-lg-flex justify-content-center draw">
            <Row>
                <Col className="d-flex align-items-center justify-content-center rounded-circle raffle">
                    <Row>
                        {/* for finished rounds  roundResults*/}
                        <Col className={this.state.winningNumbers.length > 0 && this.state.resultAnime ? "d-flex align-items-center justify-content-center rounded-circle raffle-inner raffle-inner-active" : "d-none"}>
                            <Row xs={10} span={1} className="w-100 d-flex align-items-center justify-content-around">
                                <Col xs={1} className={`${this.getBallClassName(this.state.winningNumbers[0])}`}>
                                    <span className={`h-100 align-items-center justify-content-center ${this.state.revealFirstNumber}`}>{this.state.winningNumbers[0]}</span>
                                </Col>
                                <Col xs={1} className={`${this.getBallClassName(this.state.winningNumbers[1])}`}>
                                    <span className={`h-100 align-items-center justify-content-center ${this.state.revealSecondNumber}`}>{this.state.winningNumbers[1]}</span>
                                </Col>
                                <Col xs={1} className={`${this.getBallClassName(this.state.winningNumbers[2])}`}>
                                    <span className={`h-100 align-items-center justify-content-center ${this.state.revealThirdNumber}`}>{this.state.winningNumbers[2]}</span>
                                </Col>
                                <Col xs={1} className={`${this.getBallClassName(this.state.winningNumbers[3])}`}>
                                    <span className={`h-100 align-items-center justify-content-center ${this.state.revealFourthNumber}`}>{this.state.winningNumbers[3]}</span>
                                </Col>
                                <Col xs={1} className={`${this.getBallClassName(this.state.winningNumbers[4])}`}>
                                    <span className={`h-100 align-items-center justify-content-center ${this.state.revealFifthNumber}`}>{this.state.winningNumbers[4]}</span>
                                </Col>
                                <Col xs={1} className={`ball black-zoom bzoom`}>
                                    <span className={`h-100 align-items-center justify-content-center ${this.state.revealPowerball}`}>{this.state.winningNumbers[5]}</span>
                                </Col>
                            </Row>
                        </Col>

                        {/* for running rounds */} 
                        {/* raffle-inner-active */}
                        <Col className={this.state.resultAnime ? "d-none" : this.state.count[0] > 0 ? "align-items-center justify-content-center rounded-circle raffle-inner" : "align-items-center justify-content-center rounded-circle raffle-inner"}>
                            <Row xs={12} className="align-items-end h-50">
                                <Col xs={12} className="d-flex justify-content-center next-round">
                                    {this.state.nextRoundId ? <FormattedMessage id="app.round"
                                        defaultMessage="Round" /> : null
                                    } &nbsp; <span>{this.state.nextRoundId}</span>
                                </Col>
                            </Row>
                            <Row xs={12} className="align-items-start h-50 timer-count">
                                <Col xs={12} className="d-flex justify-content-center subtitle">
                                    {main}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Col>
    }
}


