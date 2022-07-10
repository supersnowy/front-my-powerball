import React, { Component } from 'react'
//external libraries

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image'

import { connect } from 'react-redux'
import moment, { lang } from 'moment'
import * as signalR from '@aspnet/signalr'
//import actions
import * as ProductActions from '../../actions/products'
import * as AppActions from '../../actions/app'
//import constants
import { apiEndPoints } from '../../constants'
//import assets
//import custom components
import Toast from '../../components/Toast'
//import constants
import { defaultProductList } from '../../utils/common'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { addLocaleData } from "react-intl";
import locale_en from 'react-intl/locale-data/en';
import locale_pt from 'react-intl/locale-data/pt';
import locale_es from 'react-intl/locale-data/es';
import locale_ko from 'react-intl/locale-data/ko';
import Draw from '../../components/Draw/Draw';
import Results from '../../components/Results/Results';
import Transactions from '../../components/Transactions/Transactions';
import moaFooter from "../../assets/images/moa_gaming.png";
addLocaleData([...locale_en, ...locale_ko, ...locale_pt, ...locale_es]);


class HomeContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedProduct: 0,
            productList: [],
            cartArray: [],
            cloneProductList: [],
            customerInput: 0.0,
            openSidebar: false,
            totalBalance: 0,
            isAuthenticated: false,
            isLoading: true,
            responseRound: {},
            customerSettings: {},
            lastRoundId: '',
            recentResults: [],
            minBet: 0,
            errors: 0,
            nextRoundTime: '',
            count: '',
            nextRoundId: '',
            activeTab: null
        }

    }

    getDomainName(hostName) {
        return hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
    }

    componentDidMount() {
        this.callUpdateHub()
        this.handleStart()
    }

    handleStart = () => {
        this.timer = setInterval(() => {
            const next = this.state.nextRoundTime
            const newCount = this.calculateTime(next);
            this.setState({ count: newCount })
        }, 1000)
    }


    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.userSettings !== prevProps.userSettings) {
            if (this.props.userSettings.UserId !== '') {
                const userId = this.props.userSettings.UserId;
                window.dataLayer = window.dataLayer || [];
                function gtag() { window.dataLayer.push(arguments); }
                gtag('set', { 'user_id': { userId } }); // Set the user ID using signed-in user_id.
            }
        }

        if (this.props.productList !== prevProps.productList) {
            const products = JSON.parse(this.props.productList)

            for (let i = 0; i < products.length; i++) {

                products[i].isSelected = false
                let markets = products[i].markets
                for (let j = 0; j < markets.length; j++) {
                    let selection = markets[j].bets
                    for (let k = 0; k < selection.length; k++) {
                        selection[k].isChecked = false
                    }
                }
            }
            const cloneProducts = JSON.parse(JSON.stringify(products))

            this.setState({
                productList: products,
                cloneProductList: cloneProducts
            })

            if (products.length > 0) {
                this.setState({
                    nextRoundTime: moment.utc(products[0].startTime),
                    nextRoundId: products[0].powerballRoundId
                })
            }
        }

        if (this.props.success !== prevProps.success) {

            if (this.props.success !== '') {

                const params = this.convertToObject(this.props.location.search)
                var { token, customerId } = params

                const custId = Number(customerId)

                setTimeout(() => {
                    const { cloneProductList } = this.state
                    const productList = JSON.parse(JSON.stringify(cloneProductList))
                    this.setState({
                        productList: productList,
                        cartArray: [],
                        customerInput: this.state.minBet,
                    })

                    this.props.dispatch(
                        ProductActions.playerAuthenticate({
                            UserToken: token,
                            CustomerId: custId
                        })
                    )


                    this.props.dispatch(AppActions.resetState());
                    this.props.dispatch(AppActions.loading(false));

                }, 2500);
            }
        }


        if (this.props.totalBalance !== prevProps.totalBalance) {
            const currentBalance = this.props.totalBalance

            this.setState({ totalBalance: currentBalance })
        }

        if (this.props.loading !== prevProps.loading) {
            this.setState({ isLoading: this.props.loading })
        }

        if (this.props.customerSettings !== prevProps.customerSettings) {
            this.setState({ customerSettings: this.props.customerSettings, minBet: this.props.customerSettings.PerRoundBetMin, customerInput: this.props.customerSettings.PerRoundBetMin })
        }


        if (this.props.recentResults !== prevProps.recentResults) {
            this.setState({ recentResults: this.props.recentResults })
        }

        if (this.props.activeTab !== prevProps.activeTab) {
            this.setState({ activeTab: this.props.activeTab })
        }

    }

    handleTabClick(id) {

        if (id === this.state.activeTab) {
            this.props.dispatch(AppActions.changeTab("none"));
        }
        else {
            this.props.dispatch(AppActions.changeTab(id));
        }
    }

    convertToObject = url => {
        const arr = url.slice(1).split(/&|=/)
        let params = {}

        for (let i = 0; i < arr.length; i += 2) {
            const key = arr[i],
                value = arr[i + 1]
            params[key] = value
        }
        return params
    }

    callUpdateHub = () => {
        const connection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Information)
            .withUrl(apiEndPoints.UPDATE_HUB_URL, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .build()
        let _this = this

        connection.on('send', data => {
        })

        connection.on('open', data => {
            _this.setState({ errors: 0 })
        })

        connection.on('ReceiveMessage', message => {
            if (message.messageType === "ResponseRound") {
                this.setState({ responseRound: message })
            }
            _this._productListUpdate(message)
        })

        async function start() {
            await connection.start()

            const params = _this.convertToObject(_this.props.location.search)
            var { token, customerId } = params

            if (!customerId) {
                customerId = "1053"
            }
            const custId = Number(customerId)

            setTimeout(() => {

                _this.props.dispatch(ProductActions.loadLastResults({
                    UserToken: token,
                    CustomerId: custId
                }));
            }, 20)


            setTimeout(() => {

            }, 20)
            _this.props.dispatch(ProductActions.getProductList({
                UserToken: token,
                CustomerId: custId
            }))

            setTimeout(() => {
                _this.props.dispatch(
                    ProductActions.playerAuthenticate({
                        UserToken: token,
                        CustomerId: custId
                    })
                )
            }, 20)
        }

        start()

        connection.onclose(async () => {
            if (_this.state.errors < 3) {
                setTimeout(() => start(), 6000)
                _this.setState({ errors: _this.state.errors++ })
            }
            else {
                _this.setState({ error: "Connection lost. Please refresh" })
            }
        })
    }


    _productListUpdate = betsObject => {
        const { productList, cloneProductList, cartArray } = this.state
        if (
            (productList && productList.length > 0) ||
            (cloneProductList && cloneProductList.length > 0) ||
            betsObject.operationType === 0
        ) {
            let cartItem = cartArray
            let prdList = productList
            let cloneProList = JSON.parse(JSON.stringify(cloneProductList))
            if (betsObject.operationType === 0 && betsObject.content.status === 1) {
                // New added product               
                const newList = defaultProductList(betsObject.content)
                prdList = JSON.parse(JSON.stringify(newList))
                cloneProList = JSON.parse(JSON.stringify(newList))

                const params = this.convertToObject(this.props.location.search)
                var { token, customerId } = params

                if (!customerId) {
                    customerId = "1053" //mandogames
                }
                const custId = Number(customerId)

                this.props.dispatch(ProductActions.getProductList({
                    UserToken: token,
                    CustomerId: custId
                }))

                setTimeout(() => {
                    this.props.dispatch(ProductActions.loadLastResults({
                        UserToken: token,
                        CustomerId: custId
                    }));
                }, 20)

                if (this.props.isAuthenticated) {
                    setTimeout(() => {
                        this.props.dispatch(
                            ProductActions.playerAuthenticate({
                                UserToken: token,
                                CustomerId: custId
                            }))
                    }, 20)
                }

            } else if (betsObject.operationType === 1) {
                // Updated Product
                const index = prdList.findIndex(products => products.id === betsObject.content.id)
                const cloneIndex = cloneProList.findIndex(
                    prod => prod.id === betsObject.content.id
                )
                // Remove all bets if status > 1
                if (betsObject.content.status > 1) {
                    if (index > -1) {

                        prdList[index].status = 2;

                        let markets = prdList[index].markets
                        for (let j = 0; j < markets.length; j++) {
                            let bets = markets[j].bets
                            for (let k = 0; k < bets.length; k++) {
                                bets[k].status = 2;
                            }
                        }

                    }
                    if (cloneIndex > -1) {
                        cloneProList[cloneIndex].status = 2;
                        let markets = cloneProList[cloneIndex].markets
                        for (let j = 0; j < markets.length; j++) {
                            let bets = markets[j].bets
                            for (let k = 0; k < bets.length; k++) {
                                bets[k].status = 2;
                            }
                        }
                    }
                    if (cartItem.length > 0) {
                        for (let i = 0; i < cartItem.length; i++) {
                            if (cartItem[i].mainProductID === betsObject.content.id) {
                                cartItem[i].status = 2
                            }
                        }
                    }
                } else {
                    if (index > -1) {
                        const preSelected = productList[index]
                        prdList[index] = betsObject.content
                        prdList[index].isSelected = productList[index].isSelected
                        let markets = prdList[index].markets
                        for (let j = 0; j < markets.length; j++) {
                            let selection = markets[j].bets
                            for (let k = 0; k < selection.length; k++) {
                                selection[k] = Object.assign(
                                    preSelected.markets[j].bets[k],
                                    selection[k]
                                )
                            }
                        }
                    }
                    if (cloneIndex > -1) {
                        const preSelectedClone = cloneProList[cloneIndex].markets
                        cloneProList[cloneIndex] = betsObject.content
                        cloneProList[cloneIndex].isSelected = false
                        let cloneMarkets = cloneProList[cloneIndex].markets
                        for (let j = 0; j < cloneMarkets.length; j++) {
                            let cloneSelection = cloneMarkets[j].bets
                            for (let k = 0; k < cloneSelection.length; k++) {
                                cloneSelection[k] = Object.assign(
                                    preSelectedClone[j].bets[k],
                                    cloneSelection[k]
                                )
                                //cloneSelection[k].isChecked = false;
                            }
                        }
                    }
                    if (cartItem.length > 0) {
                        for (let i = 0; i < cartItem.length; i++) {
                            if (cartItem[i].mainProductID === betsObject.content.id) {
                                let markets = betsObject.content.markets
                                const marketIndex = markets.findIndex(
                                    item => item.id === cartItem[i].subProductId
                                )
                                if (marketIndex > -1) {
                                    cartItem[i].productName = markets[marketIndex].name
                                    let bets = markets[marketIndex].bets
                                    const betsIndex = bets.findIndex(
                                        item => item.id === cartItem[i].id
                                    )
                                    if (betsIndex > -1) {
                                        cartItem[i].name = bets[betsIndex].name
                                        cartItem[i].price = bets[betsIndex].price
                                        cartItem[i].status = bets[betsIndex].status
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (betsObject.operationType === 2) {
                // Deleted Product
                const index = prdList.findIndex(
                    products => products.id === betsObject.content.id
                )
                if (index > -1) {
                    prdList.splice(index, 1)
                }
                const clonIndex = cloneProList.findIndex(
                    products => products.id === betsObject.content.id
                )
                if (clonIndex > -1) {
                    cloneProList.splice(clonIndex, 1)
                }
                if (cartItem.length > 0) {
                    for (let i = 0; i < cartItem.length; i++) {
                        if (cartItem[i].mainProductID === betsObject.content.id) {
                            cartItem[i].status = 2
                        }
                    }
                }
            }
            let newCloneList = cloneProList

            this.setState({
                productList: prdList,
                cloneProductList: newCloneList,
                cartArray: cartItem
            })
        }
    }

    _renderProductNumber = (products, index) => {
        products.isSelected = !products.isSelected
        this.setState({
            selectedProduct: products.id
        })
    }

    /**
     * Open product sidebar for mobile view
     */
    _openSidebar = () => {
        this.setState({
            openSidebar: !this.state.openSidebar
        })
    }

    _selectionChange = (
        event,
        selection,
        subProductId,
        subProductName,
        mainProductID,
        roundId,
        betsIndex
    ) => {
        let checked = !selection.isChecked
        selection.isChecked = checked

        selection.productName = subProductName
        selection.productId = `${subProductName}${mainProductID}`.replace(/\s/g, '')
        selection.subProductId = subProductId
        selection.mainProductID = mainProductID
        selection.roundId = roundId

        let { productList, cartArray } = this.state
        let newProArray = JSON.parse(JSON.stringify(productList))
        const proIndex = newProArray.findIndex(x => x.id === mainProductID)
        if (proIndex > -1) {
            let markets = newProArray[proIndex].markets
            const marketIndex = markets.findIndex(y => y.id === subProductId)
            if (marketIndex > -1) {
                let bets = markets[marketIndex].bets
                for (let i = 0; i < bets.length; i++) {
                    bets[i].isChecked = false
                }
                bets[betsIndex].isChecked = checked
            }

        }

        let newArrayList = []
        let arrayList = cartArray
        if (selection.status !== 2) {
            const cartIndex = arrayList.findIndex(
                x => x.productId === selection.productId
            )
            if (cartIndex > -1) {
                arrayList[cartIndex].isChecked = false
                arrayList.splice(cartIndex, 1)
            }
            if (checked) {
                arrayList.push(selection)
            }
        }
        newArrayList = arrayList

        this.setState({
            productList: newProArray,
            cartArray: newArrayList
        })
    }

    _subProductSelection = (
        selections,
        subProduct,
        mainProductID,
        roundId,
        islarge,
        flag = false
    ) => {
        var canHover = !(matchMedia('(hover: none)').matches);
        const subProductId = subProduct.id;
        const subProductName = subProduct.name;
        const name = flag
            ? `selection${mainProductID}${subProductId}_1`
            : `selection${mainProductID}${subProductId}`;
        const currentRoundeCart = this.state.cartArray.filter(bet => bet.roundId === roundId)
        const lastCheckedId = currentRoundeCart.length ? currentRoundeCart[currentRoundeCart.length - 1].subProductId : undefined
        const isDisabledAccordingToChecked = this._isDisabledAccordingToChecked(lastCheckedId, subProductId)
        const cols = selections.map((selection, idx) => (

            <Col key={selection.id} className={"bet product-box align-items-center justify-content-between d-flex" + (islarge && ((idx + 1) % 3 === 0) ? " fullBtn m-1" : "")}>
                <label className="m-0 selection-box h-100 w-100 d-flex">
                    <input
                        type="checkbox"
                        className="w-100"
                        name={name}
                        value={`${subProductId}${selection.id}`}
                        onChange={event => {
                            this._selectionChange(
                                event,
                                selection,
                                subProductId,
                                subProductName,
                                mainProductID,
                                roundId,
                                idx
                            );
                        }}
                        checked={isDisabledAccordingToChecked ? false : selection.isChecked}
                        disabled={selection.status !== 1 || isDisabledAccordingToChecked}
                    />
                    <span className={(selection.status === 1 && !isDisabledAccordingToChecked && canHover) ? "p-2 w-100 h-100 checkmark canHover d-flex align-items-center" : "p-2 w-100 h-100 checkmark d-flex align-items-center"}>
                        <FormattedMessage id={selection.name}
                            defaultMessage="Selection Name"
                            description="Selection Name" />
                        {selection.line ? <span>&nbsp;{"(" + selection.line + ")"}</span> : " "} <span className="ml-auto">{selection.price}</span></span>




                </label>
                {
                    (selection.status !== 1 || isDisabledAccordingToChecked) ?
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock-fill lockIcon" viewBox="0 0 16 16">
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                        </svg> : ""
                }
            </Col>
        ));
        const noRows = Math.ceil(selections.length / 2);
        const rows = Array.from(Array(noRows)).map((n, i) => (
            <Row key={mainProductID + i} className="w-100 m-0">
                {islarge ? cols.slice(i * 3, (i + 1) * 3) : cols.slice(i * 2, (i + 1) * 2)}
            </Row>
        ));

        return rows;

    };

    _isDisabledAccordingToChecked = (checkedId, currentId) => {
        const { customerSettings } = this.state;
        if (checkedId && checkedId !== currentId && customerSettings && customerSettings.MultibetOptions && customerSettings.MultibetOptions.length) {
            const multibetOptions = customerSettings.MultibetOptions;
            var filterOptions = multibetOptions.filter(options => {
                if (options.includes(checkedId)) {
                    return options.includes(currentId)
                }
                return false;
            })
            return !filterOptions.length;
        }
        return false;
    }

    _subProductList = (subProducts, mainProductID, roundId) => {
        return subProducts.map(product => {
            return (
                <div
                    key={Math.random()}
                    className="product-left-box product-detail-box"
                >
                    <h2 className="single-title">
                        <FormattedMessage id={product.name}
                            defaultMessage="Market Name"
                            description="Market Name" />
                    </h2>
                    <div className="product-box-wrapper">
                        {this._subProductSelection(
                            product.bets,
                            product,
                            mainProductID,
                            roundId
                        )}
                        <div className="clear" />
                    </div>
                </div>
            )
        })
    }

    _removerCartItem = index => {
        let cartItem = []
        const { productList, cartArray } = this.state
        let proList = productList

        cartItem = JSON.parse(JSON.stringify(cartArray))

        let mainProductID = cartItem[index].mainProductID
        let subProductId = cartItem[index].subProductId
        let betsId = cartItem[index].id

        const proIndex = proList.findIndex(x => x.id === mainProductID)
        if (proIndex > -1) {
            let markets = proList[proIndex].markets
            const marketIndex = markets.findIndex(y => y.id === subProductId)
            if (marketIndex > -1) {
                let bets = markets[marketIndex].bets
                let betsIndex = bets.findIndex(y => y.id === betsId)
                if (betsIndex > -1) {
                    bets[betsIndex].isChecked = false
                }
            }
        }

        cartItem[index].isChecked = false
        cartItem.splice(index, 1)

        let newCartItem = cartItem
        let newProductList = proList
        this.setState({ cartArray: newCartItem, productList: newProductList })
    }

    _clearCart = () => {
        const { cloneProductList, minBet } = this.state

        let proList = JSON.parse(JSON.stringify(cloneProductList))
        for (let i = 0; i < proList.length; i++) {
            proList[i].isSelected = false

            if (proList[i].status !== 2) {
                let markets = proList[i].markets
                for (let j = 0; j < markets.length; j++) {
                    let selection = markets[j].bets
                    for (let k = 0; k < selection.length; k++) {
                        selection[k].isChecked = false
                    }
                }
            }
        }

        this.setState({
            cartArray: [],
            customerInput: minBet,
            productList: proList
        })
        //this.props.dispatch(ProductActions.getProductListSuccess(proList));
    }

    _customerInputChange = event => {
        const value = event.target.value ? event.target.value : 0
        this.setState({ customerInput: parseInt(value) })
    }

    _quickButtons = input => {
        this.setState({ customerInput: input })
    }

    _submitCart = () => {
        const { cartArray, customerInput, isLoading } = this.state

        if (isLoading) {
            return;
        }

        //const productList = JSON.parse(JSON.stringify(cloneProductList));
        const params = this.convertToObject(this.props.location.search)
        var { token, customerId } = params
        if (!customerId) {
            customerId = "1053"
        }
        const custId = Number(customerId)

        let finalCart = {
            UserToken: token,
            CustomerId: custId,
            BetAmount: parseFloat(customerInput),
            RoundBetIds: []
        }

        if (cartArray.length > 0) {
            finalCart.RoundBetIds = cartArray.map(item => {
                return item.id
            })

            this.props.dispatch(ProductActions.sendCartToServer(finalCart, token))
        }

        /*this.setState({
          cartArray: [],
        });*/


        //this._clearCart();
    }

    formatMoney(n, c, d, t) {
        if (lang === "ko" && (n % 1000000 === 0) && (n / 1000000 > 0)) {
            return (n / 1000000) + "만";
        }
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    calculateTime(time) {
        var curr = moment(new Date()).utc();
        var duration = moment.utc(moment(time, "DD/MM/YYYY HH:mm:ss").diff(moment(curr, "DD/MM/YYYY HH:mm:ss"))).format("mm:ss")

        return duration;
    }

    render() {
        const { productList, cartArray, customerInput, customerSettings, isLoading, recentResults } = this.state
        const { userSettings, isAuthenticated } = this.props
        const cartStatus =
            cartArray && cartArray.filter(item => item.status === 2).length === 0 && cartArray.filter(item => item.status === 1).length > 0 && isAuthenticated === true && customerInput >= 0 && !isLoading
        let total = 1

        const limit = customerSettings
            ? customerSettings.PerRoundBetLimit
            : undefined
        const minBet = customerSettings
            ? this.formatMoney(customerSettings.PerRoundBetMin, 0)
            : undefined

        const search = window.location.search;
        const params = new URLSearchParams(search);
        var lang = params.get('language')
        if (lang === null) {
            lang = "en";
        }
        else {
            lang = lang.substring(0, 2);
        }

        return (
            <Container>
                {/* Navbar */}
                <Navbar expand="xs" variant="dark" bg="dark" fixed="bottom" className="d-flex d-lg-none justify-content-around navbar align-items-start text-center">
                    <Navbar.Brand onClick={() => this.handleTabClick("results")}>
                        <svg width="25px" height="25px" viewBox="0 0 16 16" className="bi bi-clock" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm8-7A8 8 0 1 1 0 8a8 8 0 0 1 16 0z" />
                            <path fillRule="evenodd" d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z" />
                        </svg>
                        <div className="nav-title" ><FormattedMessage id="app.results"
                            defaultMessage="Results" /></div>
                    </Navbar.Brand>
                    <Navbar.Brand onClick={() => this.handleTabClick("betslip")} className="cart">
                        <svg width="30px" height="30px" viewBox="0 0 16 16" className="bi bi-cart2" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                        </svg>
                        <div className="nav-title"><FormattedMessage id="app.selections"
                            defaultMessage="Selections" /> <span>({cartArray.length})</span></div>
                    </Navbar.Brand>
                    <Navbar.Brand onClick={() => this.handleTabClick("transactions")}>
                        <svg width="25px" height="25px" viewBox="0 0 16 16" className="bi bi-person" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 5c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                        </svg>
                        <div className="nav-title"><FormattedMessage id="app.transactions"
                            defaultMessage="Transactions" /></div>
                    </Navbar.Brand>
                </Navbar>

                {/* Navbar END */}
                <Row className="game-container">
                    <Col className="d-flex d-lg-none text-left balance"><FormattedMessage id="app.balance" defaultMessage="Balance" />: <span className="highlight ml-1"> {this.state.totalBalance ? this.state.totalBalance : "0"}</span></Col>
                    <Col className="counter" xs={12} lg={8}>
                        <Row className="position-absolute title-container">
                            {/* <Image title="in" src={require("../../assets/images/GameHeader.png")} className="title-container-img" /> */}
                            {/* <Col xs={12} className="title align-items-center justify-content-center d-flex">
                                <Row>
                                    <Col xs={12} className="text-uppercase powerball-header text-center">
                                        <FormattedMessage id="app.powerball"
                                            defaultMessage="Powerball" />
                                    </Col>
                                    <Col xs={12} className="text-uppercase brand-header text-center">
                                        {this.state.customerSettings && this.state.customerSettings.CssFile ? this.state.customerSettings.CssFile : "MandoGames"}
                                    </Col>
                                </Row>
                            </Col> */}
                        </Row>
                        <Row className="position-relative next-container">

                            {/* Draw */}
                            <Draw roundMessage={this.state.responseRound} nextRoundId={this.state.nextRoundId} nextRoundTime={this.state.nextRoundTime} />

                        </Row>
                    </Col>

                    {/* className="d-none d-lg-block recent" */}
                    <Col className={this.state.activeTab === null || this.state.activeTab === "none" ? "d-none d-lg-block recent overflow-auto" : "d-flex overflow-auto"} xs={12} lg={4}>

                        <Results rounds={recentResults} isAuthenticated={isAuthenticated} isActive={this.state.activeTab} />
                        <Transactions transactions={userSettings.transactions} isAuthenticated={isAuthenticated} isActive={this.state.activeTab} />

                    </Col>

                    {/* Markets 
                <RoundMarkets roundMarkets={(productList && productList.length > 0)?productList[0].markets:[] } />*/}
                    <Col className="markets" xs={12} lg={8}>
                        <Row>
                            <Col className="text-left subtitle bg-dark markets-title">
                                <FormattedMessage id="app.roundstitle"
                                    defaultMessage="Upcoming Rounds"
                                    description="Upcoming Rounds" />
                            </Col>
                        </Row>
                        <Row className="h-100">
                            <Col xs={12}>
                                {
                                    (productList && productList.length > 0 && productList[0].markets && productList[0].markets.length > 0) ? productList[0].markets.map((roundMarket) => {
                                        return <Row key={roundMarket.id}>
                                            <Col xs={12} className="text-left subtitle highlight market-title">
                                                <FormattedMessage id={roundMarket.name}
                                                    defaultMessage="Market Name"
                                                    description="Market Name" />
                                            </Col>
                                            {this._subProductSelection(
                                                roundMarket.bets,
                                                roundMarket,
                                                productList[0].id,
                                                productList[0].powerballRoundId,
                                                (roundMarket.bets.length % 3 === 0)
                                            )}
                                        </Row>
                                    }) :
                                        <Row className="h-75 align-items-center" style={{ paddingLeft: "30px", paddingRight: "30px", backgroundColor: "#171C2C", paddingBottom: "10px" }}>
                                            <Col xs={12} className="d-flex align-items-center justify-content-center">
                                                <FormattedMessage id="app.msg-no_rounds"
                                                    defaultMessage="No available rounds to bet"
                                                    description="No available rounds to bet" /></Col></Row>
                                }
                            </Col>
                        </Row>
                    </Col>
                    {/*
                    <Col className={this.state.activeTab === "betslip" ? "d-flex betslip" : "d-none d-lg-block betslip"}>
                    */}
                    <Col xs={12} lg={4} className={this.state.activeTab === "betslip" ? "betslip justify-content-center activeTab" : "d-none d-lg-block betslip"}>
                        <Row xs={12}>
                            <Col className="text-left subtitle bg-dark">
                                <Row className="w-100 m-0">
                                    <Col xs={7} lg={8} className="p-0"><FormattedMessage id="app.cart-selected" defaultMessage="Selected" /> <span>
                                        ({cartArray.length})</span> </Col>
                                    <Col xs={4}><FormattedMessage id="app.cart-price" defaultMessage="Price" /></Col>
                                    <Col xs={1} lg={0} className="p-0 closeTab"><span onClick={() => this.props.dispatch(AppActions.changeTab("none"))}>+</span></Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row className={this.props.success || this.props.error ? "d-flex" : "d-none"}>
                            {this.props.success && (<Toast level={'success'} message={this.props.success} />)}
                            {this.props.error && (<Toast level={'danger'} message={this.props.error} />)}
                        </Row>
                        {cartArray && cartArray.length > 0 ? (
                            cartArray.map((item, index) => {
                                total *= parseFloat(item.price)
                                return (
                                    <Row
                                        key={index}
                                        className={
                                            item.status === 2
                                                ? 'disabled  p-3'
                                                : ' p-3'
                                        }
                                    >
                                        <Col xs={7} lg={8}><FormattedHTMLMessage id={item.name}
                                            defaultMessage="Bet Name" />
                                        </Col>
                                        <Col xs={4} lg={2}> <span className="product-number" title={item.price}>
                                            {' '}
                                            {item.price}{' '}
                                        </span>  </Col>
                                        <Col xs={1} className="p-0 text-center close">
                                            <span onClick={() => this._removerCartItem(index)}>+</span>
                                        </Col>
                                        <Col xs={12}>{item.roundId} -  <FormattedMessage id={item.productName}
                                            defaultMessage="Market Name"
                                            description="Market Name" /></Col>


                                    </Row>
                                )
                            })
                        ) : (
                                <Row className="m-4 align-items-center"><Col xs={12} className="d-flex align-items-center justify-content-center"><FormattedMessage id="app.cart-click_to_add"
                                    defaultMessage="Click a price to add a selection" /></Col></Row>
                            )}
                        <Row><Col xs={12} className="d-flex justify-content-between p-3">
                            <FormattedMessage id="app.cart-total_odds"
                                defaultMessage="Total Odds" />
                            {cartArray.length === 0 ? 0 : total.toFixed(2)}{' '}
                        </Col></Row>
                        <Row>
                            <Col xs={8}> <FormattedMessage id="app.cart-stake"
                                defaultMessage="Stake" />
                            </Col>
                            <Col xs={4}> <input className="w-100"
                                type="number"
                                name="customer-input"
                                value={this.state.customerInput}
                                min={this.state.minBet}
                                onInput={e => {
                                    e.target.value = Math.max(0, parseInt(e.target.value))
                                        .toString()
                                        .slice(0, 7)
                                }}
                                onChange={this._customerInputChange}
                            />
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-center mt-3 mb-2">
                            <Col xs={3} className="p-0">
                                <button
                                    className="quick-btn btn-send"
                                    onClick={() => this._quickButtons(100000)}>
                                    {this.formatMoney(100000, 0)}
                                </button>
                            </Col>
                            <Col xs={{ span: 3, offset: 1 }} className="p-0">
                                <button
                                    className="quick-btn btn-send"
                                    onClick={() => this._quickButtons(250000)}>
                                    {this.formatMoney(250000, 0)}
                                </button>
                            </Col>
                            <Col xs={{ span: 3, offset: 1 }} className="p-0">
                                <button
                                    className="quick-btn btn-send"
                                    onClick={() => this._quickButtons(1000000)}>
                                    {this.formatMoney(1000000, 0)}
                                </button>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="limit-message">
                                <FormattedMessage id="app.limit-message"
                                    defaultMessage="Limit Message" />  &nbsp;
                                       {this.formatMoney(limit, 0)}
                                <FormattedMessage id="app.KRW"
                                    defaultMessage="KRW" />
                                <br />

                                <FormattedHTMLMessage id="app.minimum-message"
                                    defaultMessage="Minimum Message" />  &nbsp;
                                       {minBet}
                                <FormattedHTMLMessage id="app.limit-KRW"
                                    defaultMessage="KRW" />
                                <br />

                                <span className="limit-alert">
                                    <FormattedMessage id="app.limit-alert"
                                        defaultMessage="Limit Alert" />

                                </span>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={8}> <FormattedMessage id="app.cart-to_return"
                                defaultMessage="To Return" />
                            </Col>
                            <Col xs={4} className="text-right"> {userSettings.currencyIso === "KRW" ? '₩' : '$'}{this.formatMoney((customerInput * total.toFixed(2)).toFixed(2), 0)}</Col></Row>


                        <Row>
                            <Col xs={12} className="d-flex justify-content-end p-3">  <button
                                className="btn btn-clear"
                                onClick={this._clearCart}
                            >
                                {' '}

                                <FormattedMessage id="app.cart-btn_clear"
                                    defaultMessage="Clear" />
                                {' '}
                            </button>
                                <button
                                    ref={btn => { this.btn = btn; }}
                                    className={
                                        cartArray.length > 0 && cartStatus
                                            ? 'btn btn-send'
                                            : 'btn btn-hover'
                                    }
                                    onClick={this._submitCart}
                                    disabled={cartArray.length === 0 || !cartStatus || isLoading}
                                >
                                    {' '}
                                    <FormattedMessage id="app.cart-btn_send"
                                        defaultMessage="Send it" />
                                    {' '}
                                </button>
                            </Col>
                        </Row>

                    </Col>
                    <Col xs={12} className="text-center moafooter"><a href="https://moagaming.com" target="blank"><Image title="moa gaming" src={moaFooter} /> </a></Col>

                </Row>
                {!isLoading && productList.length === 0 ?
                    <div className="message d-flex justify-content-center align-items-center"><FormattedMessage id="app.maintenance" defaultMessage="Maintenance" /></div>
                    : <div className="d-none"></div>}
                <Row>
                    <Col xs={12} className="text-center footer">Powered by <a href="https://mandogames.com" target="blank">mandogames</a></Col>
                </Row>
            </Container >
        )
    }
}

const mapStateToProps = state => ({
    loading: state.appReducer.loading,
    productList: state.productReducer.productList,
    success: state.productReducer.success,
    error: state.productReducer.error,
    isAuthenticated: state.productReducer.isAuthenticated,
    userSettings: state.productReducer.userSettings,
    totalBalance: state.productReducer.totalBalance,
    recentResults: state.productReducer.recentResults,
    activeTab: state.appReducer.activeTab
})

export default connect(mapStateToProps)(HomeContainer)
