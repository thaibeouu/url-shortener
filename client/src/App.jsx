import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import timeago from 'timeago.js';
import { connect } from 'react-redux';
import {
  Button,
  Input,
  Container,
  ListGroup,
  ListGroupItem,
  Badge,
  InputGroup,
  InputGroupAddon,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  Navbar,
  NavbarBrand,
} from 'reactstrap';
import {
  initUrls, addNewUrl, addNotification, removeNotification,
} from './actions/action';

const homeDir = 'http://localhost:3001/';
let socket;
const mapStateToProps = (state = {}) => ({ ...state });
class App extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    socket = socketIOClient(homeDir);
    dispatch(initUrls());
    socket.on('newUrl', (data) => {
      dispatch(addNotification(data));
      dispatch(initUrls());
    });
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  render() {
    const { dispatch, items, notifications } = this.props;
    const onAddBtnClick = (event) => {
      const urlInput = document.getElementById('urlInput');
      const infoField = document.getElementsByClassName('invalid-feedback')[0];

      if (!urlInput.validity.valid) {
        event.preventDefault();
        event.stopPropagation();
        infoField.style.display = 'block';
      } else {
        infoField.style.display = 'none';
        dispatch(addNewUrl(urlInput.value));
        urlInput.value = '';
      }
    };
    const onNotificationClick = (event) => {
      const code = event.target.id;
      dispatch(removeNotification(code));
      window.open(homeDir + code);
    };
    const onUrlClick = () => {
      dispatch(initUrls());
    };
    const urls = items.map((item, i) => (
      <React.Fragment key={i}>
        <ListGroupItem className="justify-content-between">
          <a
            onClick={onUrlClick}
            href={homeDir + item.code}
            target="_blank"
            rel="noopener noreferrer"
          >
            {homeDir + item.code}
          </a>
          {' '}
          <Badge color="primary" pill>
            visited:
            {' '}
            {item.visited}
          </Badge>
          {' '}
          <span className="float-right text-muted">
            Last visited:
            {' '}
            {timeago().format(item.lastVisited)}
          </span>
        </ListGroupItem>
      </React.Fragment>
    ));

    return (
      <Container>
        <React.Fragment>
          <Navbar color="light" light expand="md">
            <NavbarBrand href="/">URL Shortener</NavbarBrand>
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav color="light">
                  News
                  {' '}
                  {notifications.length > 0 ? (
                    <Badge color="danger" pill>
                      {notifications.length}
                    </Badge>
                  ) : (
                    ' '
                  )}
                </DropdownToggle>
                <DropdownMenu right>
                  {notifications.length > 0 ? (
                    notifications.map((item, i) => (
                      <React.Fragment key={i}>
                        <DropdownItem id={item} onClick={onNotificationClick}>
                          New url added: http://localhost:3001/
                          {item}
                        </DropdownItem>
                      </React.Fragment>
                    ))
                  ) : (
                    <React.Fragment>
                      <DropdownItem disabled>No news!</DropdownItem>
                    </React.Fragment>
                  )}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Navbar>
          <hr />
          <InputGroup className="needsValidation">
            <Input
              type="url"
              id="urlInput"
              required
              pattern="(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
              placeholder="Enter URL here"
            />
            <InputGroupAddon onClick={onAddBtnClick} addonType="append">
              <Button color="primary">Shorten</Button>
            </InputGroupAddon>
          </InputGroup>
          <div className="invalid-feedback">Please provide a valid url.</div>
          <hr />
          <ListGroup>{urls}</ListGroup>
        </React.Fragment>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(App);
