import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Collapse } from 'reactstrap';
import * as AppActions from '../../actions/app'
import { connect } from 'react-redux'

const TransactionStatus = {
  1: <FormattedMessage id="app.transaction-initiated" defaultMessage="Transaction Initiated" />,
  2: <FormattedMessage id="app.transaction-accepted" defaultMessage="Transaction Accepted" />,
  3: <FormattedMessage id="app.transaction-rejected" defaultMessage="Transaction Rejected" />,
  4: <FormattedMessage id="app.transaction-payment-initiated" defaultMessage="Payment Initiated" />,
  5: <FormattedMessage id="app.transaction-payment-rejected" defaultMessage="Payment Rejected" />,
  6: <FormattedMessage id="app.transaction-complete" defaultMessage="Won" />,
  7: <FormattedMessage id="app.transaction-round-lost" defaultMessage="Lost" />
};


class Transactions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapse: null,
      transactions: [],
      isActive: null
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.transactions && this.props.transactions !== prevProps.transactions && this.props.transactions.length > 0) {
      this.setState({ transactions: this.props.transactions })
    }

    if (this.props.isActive !== prevProps.isActive) {
      this.setState({ isActive: this.props.isActive })
    }
  }

  toggleCollapse = (id) => {
    if (!this.state.collapse || id !== this.state.collapse) {
      this.setState({
        collapse: id
      });
    } else if (this.state.collapse === id) {
      this.setState({ collapse: false })
    }
  }

  getTransactionStatus = (status) => {

    return TransactionStatus[status];
  }

 

  render() {

    return <Col className={this.state.isActive === null ? "transactions-container" : this.state.isActive==="transactions"? "transactions-container activeTab":"d-none" } xs={12}>
      <Row>
        <Col className="text-left subtitle bg-dark markets-title">
          <Row className="w-100 m-0">
            <Col xs={11} lg={12} className="p-0"><FormattedMessage id="app.recent-transactions"
                                        defaultMessage="Transactions" /></Col>
            <Col xs={1} className="p-0 text-center closeTab"><span onClick={() => this.props.dispatch(AppActions.changeTab("none"))}>+</span></Col>
          </Row>
        </Col>
      </Row>
      {this.props.isAuthenticated ?
        (this.state.transactions.length > 0 ?
          this.state.transactions.map((transaction) => {
            return <Row key={transaction.id} className="transaction-container align-items-center">
              <Col xs={3} className="d-flex align-items-center text-left round-result">
                {transaction.id}
              </Col>
              <Col xs={7} className="d-flex align-items-center text-left round-result">
                {this.getTransactionStatus(transaction.status)}
              </Col>
              <Col xs={2} className="d-flex align-items-center text-right round-result cursor-pointer" onClick={() => this.toggleCollapse(transaction.id)}>
                {this.state.collapse === transaction.id ? '^' : 'V'}
              </Col>
              <Collapse xs={12} isOpen={this.state.collapse === transaction.id}>
                <Row className="pl-3 justify-content-center highlight w-100">
                  <Col xs={4}><FormattedMessage id="app.transaction-total-price" defaultMessage="Total Price" /></Col>
                  <Col xs={4}><FormattedMessage id="app.transaction-bet-amount" defaultMessage="Bet Amount" /></Col>
                  <Col xs={4}><FormattedMessage id="app.transaction-win-amount" defaultMessage="Win Amount" /></Col>
                </Row>
                <Row className="pl-3 justify-content-center w-100">
                  <Col className="round-result" xs={4}> {transaction.totalPrice}</Col>
                  <Col className="round-result" xs={4}> {transaction.betAmount}&nbsp;{transaction.currencyIso}</Col>
                  <Col className="round-result" xs={4}> {transaction.winAmount}&nbsp;{transaction.currencyIso}</Col>
                </Row>
                {
                  transaction.bets.map(bet => {
                    return <Row key={bet.roundId + bet.marketName + bet.betName} className="align-items-center pl-3 pr-3 justify-content-center bet-row w-100">
                      <Col xs={5} className="round-result highlight"><FormattedMessage id="app.transaction-bet-round-id" defaultMessage="Round Id" /></Col>
                      <Col xs={7} className="round-result">{bet.roundId}</Col>
                      <Col xs={5} className="round-result highlight"><FormattedMessage id="app.transaction-bet-market-name" defaultMessage="Market Name" /> </Col>
                      <Col xs={7} className="round-result"><FormattedMessage id={bet.marketName} defaultMessage="Market Name" description="Market Name" /></Col>
                      <Col xs={5} className="round-result highlight"><FormattedMessage id="app.transaction-bet-betname" defaultMessage="Bet Name" /> </Col>
                      <Col xs={7} className="round-result"><FormattedHTMLMessage id={bet.betName} defaultMessage="Bet Name" description="Bet Name" /></Col>
                      <Col xs={5} className="round-result highlight"><FormattedMessage id="app.transaction-bet-price" defaultMessage="Price" /></Col>
                      <Col xs={7} className="round-result">{bet.price}</Col>
                    </Row>
                  })
                }
              </Collapse>
            </Row>
          }) : <Row key="no-recent-transactions" className="h-25 align-items-center"><Col xs={12} className="d-flex align-items-center justify-content-center"><FormattedMessage id="app.transactions-no-recent" defaultMessage="There are no recent transactions" /></Col></Row>)
        : <Row key="please-log-in" className="h-25 align-items-center"><Col xs={12} className="d-flex align-items-center justify-content-center" style={{height:'100px'}}><FormattedMessage id="app.transaction-login" defaultMessage="Log in to view recent transactions" /></Col></Row>}
    </Col>
  }
}



const mapStateToProps = state => ({
  activeTab: state.appReducer.activeTab
})

export default connect(mapStateToProps)(Transactions)