import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';

import { FormattedHTMLMessage } from 'react-intl';
import { addLocaleData } from "react-intl";
import locale_en from 'react-intl/locale-data/en';
import locale_ko from 'react-intl/locale-data/ko';

addLocaleData([...locale_en, ...locale_ko]);

export default class Toast extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let classes = `${this.props.level}`;
    return (
      <Col xs={12} className={`toast ${classes}`}>
            <FormattedHTMLMessage tagName='p' id={this.props.message} />
      </Col>
    )
  }
}

Toast.propTypes = {
  message: PropTypes.string.isRequired
}