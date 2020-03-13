import React, { Component, Fragment } from "react";
import { css, StyleSheet } from "aphrodite";
import { connect } from "react-redux";
import Ripples from "react-ripples";
import Toggle from "react-toggle";
import "~/components/TextEditor/stylesheets/ReactToggle.css";
import { withAlert } from "react-alert";

import FormSelect from "~/components/Form/FormSelect";
import FormInput from "~/components/Form/FormInput";
import ComponentWrapper from "~/components/ComponentWrapper";

import { DIGEST_FREQUENCY } from "~/config/constants";
import {
  checkBoxStyles,
  defaultStyles,
  hubStyles,
  selectStyles,
} from "~/config/themes/styles";
import { updateEmailPreference, fetchEmailPreference } from "~/config/fetch";
import {
  buildSubscriptionPatch,
  digestSubscriptionPatch,
  emailPreferencePatch,
} from "~/config/shims";
import { AuthActions } from "~/redux/auth";
import { MessageActions } from "~/redux/message";
import { HubActions } from "~/redux/hub";
import { subscribeToHub, unsubscribeFromHub } from "../../config/fetch";
import { doesNotExist } from "~/config/utils";
import colors from "../../config/themes/colors";
import icons from "../../config/themes/icons";

import "./stylesheets/toggle.css";

const frequencyOptions = Object.keys(DIGEST_FREQUENCY).map((key) => {
  return {
    value: DIGEST_FREQUENCY[key],
    label: key,
  };
});

const contentSubscriptionOptions = [
  {
    id: "paperSubscription",
    label: "Threads on papers I authored",
  },
  {
    id: "threadSubscription",
    label: "Comments on a thread I posted",
  },
  {
    id: "commentSubscription",
    label: "Replies to a comment I posted",
  },
  {
    id: "replySubscription",
    label: "Responses to a reply I posted",
  },
];

class UserSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      frequency: null,
      emailRecipientId: null,
      isOptedOut: null,
      // Email Input
      email: this.props.user.email && this.props.user.email,
      activeEmailInput: false,
      transition: false,
    };
    this.emailInputRef = React.createRef();
    contentSubscriptionOptions.forEach((option) => {
      this.state[option.id] = true;
    });
  }

  componentDidMount = async () => {
    if (doesNotExist(this.props.hubs)) {
      this.props.dispatch(HubActions.getHubs());
    }
    if (doesNotExist(this.props.user.email)) {
      await this.props.dispatch(AuthActions.getUser());
    }
    fetchEmailPreference().then((preference) => {
      const frequency = this.getInitialFrequencyOption(preference);
      const contentSubscriptions = this.getInitialContentSubscriptionOptions(
        preference
      );
      const isOptedOut = this.getInitialIsOptedOut(preference);
      this.setState({
        emailRecipientId: preference.id,
        frequency,
        ...contentSubscriptions,
        isOptedOut,
        email: this.props.user.email,
      });
    });
  };

  getInitialFrequencyOption = (emailPreference) => {
    const initial = frequencyOptions.filter((option) => {
      return (
        emailPreference.digestSubscription &&
        option.value ===
          emailPreference.digestSubscription.notificationFrequency
      );
    });
    return initial[0];
  };

  getInitialContentSubscriptionOptions = (emailPreference) => {
    const initial = {};
    const subscriptionKeys = Object.keys(emailPreference).filter((key) => {
      return key.includes("Subscription");
    });
    subscriptionKeys.forEach((key) => {
      initial[key] = !emailPreference[key].none;
    });
    return initial;
  };

  getInitialIsOptedOut = (emailPreference) => {
    return emailPreference.isOptedOut;
  };

  saveEmail = () => {
    this.props.dispatch(MessageActions.showMessage({ show: true, load: true }));
    const currentEmail = this.props.user.email;
    const nextEmail = this.state.email;
    const data = emailPreferencePatch({
      email: nextEmail,
    });
    const updateSubscriptions = false;
    updateEmailPreference(
      this.state.emailRecipientId,
      data,
      updateSubscriptions
    )
      .then(() => {
        this.props.dispatch(MessageActions.showMessage({ show: false }));
        this.props.dispatch(MessageActions.setMessage("Saved!"));
        this.props.dispatch(MessageActions.showMessage({ show: true }));
        this.setState({});
        this.toggleEmailInput();
      })
      .catch((err) => {
        this.displayError(err);
        this.setState({
          email: currentEmail,
        });
      });
  };

  toggleEmailInput = () => {
    this.setState({ transition: true }, () => {
      setTimeout(() => {
        this.setState(
          {
            activeEmailInput: !this.state.activeEmailInput,
            transition: false,
          },
          () => {
            this.state.activeEmailInput && this.emailInputRef.current.focus();
          }
        );
      }, 50);
    });
  };

  handleEmailChange = (id, value) => {
    this.setState({ email: value });
  };

  renderPrimaryEmail = () => {
    let { email, activeEmailInput, transition } = this.state;

    return (
      <div className={css(styles.container)}>
        <div className={css(styles.labelContainer)}>
          <div className={css(styles.listLabel)} id={"hubListTitle"}>
            {"Primary Email"}
          </div>
          <Ripples
            className={css(styles.editIcon)}
            onClick={this.toggleEmailInput}
          >
            {activeEmailInput ? (
              <i className="fal fa-times" />
            ) : (
              <i className="fas fa-pencil" />
            )}
          </Ripples>
        </div>
        <div
          className={css(
            styles.primaryEmail,
            transition && styles.blurTransition
          )}
        >
          {activeEmailInput ? (
            <form
              className={css(styles.emailInputContainer)}
              onSubmit={(e) => {
                e.preventDefault();
                this.saveEmail();
              }}
            >
              <FormInput
                getRef={this.emailInputRef}
                placeholder={"Enter an email"}
                containerStyle={styles.emailInputStyles}
                inputStyle={styles.emailInput}
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
              <Ripples
                className={css(styles.saveIcon)}
                onClick={(e) => {
                  e.preventDefault();
                  this.saveEmail();
                }}
              >
                <i className="fad fa-paper-plane" />
              </Ripples>
            </form>
          ) : (
            <div className={css(styles.paddedText)}>{email}</div>
          )}
        </div>
      </div>
    );
  };

  renderFrequencySelect() {
    return (
      <div className={css(styles.container)}>
        <div className={css(styles.listLabel)} id={"hubListTitle"}>
          {"Hub Digest Frequency"}
        </div>
        <div className={css(styles.formContainer)}>
          <FormSelect
            id={"frequencySelect"}
            options={frequencyOptions}
            value={this.state.frequency}
            containerStyle={
              (selectStyles.container, styles.formSelectContainer)
            }
            inputStyle={(selectStyles.input, styles.formSelectInput)}
            onChange={this.handleFrequencyChange}
            isSearchable={false}
          />
        </div>
      </div>
    );
  }

  handleFrequencyChange = (id, option) => {
    const currentFrequency = this.state.frequency;
    this.setState({
      frequency: option,
    });
    const data = digestSubscriptionPatch({
      notificationFrequency: option.value,
    });
    updateEmailPreference(this.state.emailRecipientId, data)
      .then(() => {
        this.props.dispatch(MessageActions.setMessage("Saved!"));
        this.props.dispatch(MessageActions.showMessage({ show: true }));
      })
      .catch((err) => {
        this.displayError(err);
        this.setState({
          frequency: currentFrequency,
        });
      });
  };

  renderSubscribedHubs = () => {
    const subscribedHubIds = this.props.subscribedHubs.map((hub) => hub.id);
    const availableHubs = this.props.hubs.filter((hub) => {
      return !subscribedHubIds.includes(hub.id);
    });

    return (
      <div className={css(styles.container)}>
        <div className={css(styles.labelContainer)}>
          <div className={css(styles.listLabel)} id={"hubListTitle"}>
            {"Currently Subscribed Hubs"}
          </div>
        </div>
        <div className={css(hubStyles.list, styles.hubsList)}>
          <FormSelect
            id={"hubSelect"}
            options={this.buildHubOptions(availableHubs)}
            containerStyle={
              (selectStyles.container, styles.formSelectContainer)
            }
            inputStyle={(selectStyles.input, styles.formSelectInput)}
            onChange={this.handleHubOnChange}
            isSearchable={true}
            placeholder={"Subscribe to a hub"}
            value={this.buildHubOptions(this.props.subscribedHubs)}
            isMulti={true}
            multiTagStyle={styles.multiTagStyle}
            multiTagLabelStyle={styles.multiTagLabelStyle}
            isClearable={false}
          />
        </div>
      </div>
    );
  };

  renderHub = (hub) => {
    return (
      <Ripples
        onClick={() => this.confirmUnsubscribe(hub)}
        key={hub.id}
        className={css(hubStyles.entry, styles.hubEntry)}
      >
        {hub.name}
        <div className={css(styles.closeIcon)}>
          <i className="fal fa-times" />
        </div>
      </Ripples>
    );
  };

  confirmUnsubscribe = (hub) => {
    this.props.alert.show({
      text: (
        <span>
          Unsubscribe from
          <span className={css(styles.hubName)}>{` ${hub.name} `}</span>?
        </span>
      ),
      buttonText: "Yes",
      onClick: () => {
        return this.handleHubUnsubscribe(hub.id);
      },
    });
  };

  handleHubUnsubscribe = (hubId) => {
    const { hubState } = this.props;
    unsubscribeFromHub(hubId)
      .then((res) => {
        this.props.dispatch(HubActions.updateHub(hubState, { ...res }));
        this.props.dispatch(MessageActions.setMessage("Unsubscribed!"));
        this.props.dispatch(MessageActions.showMessage({ show: true }));
      })
      .catch(this.displayError);
  };

  renderHubSelect() {
    const subscribedHubIds = this.props.subscribedHubs.map((hub) => hub.id);
    const availableHubs = this.props.hubs.filter((hub) => {
      return !subscribedHubIds.includes(hub.id);
    });
    return (
      <div className={css(styles.container)}>
        <div className={css(styles.listLabel)} id={"hubListTitle"}>
          {"Available Hubs"}
        </div>
        <FormSelect
          id={"hubSelect"}
          options={this.buildHubOptions(availableHubs)}
          containerStyle={(selectStyles.container, styles.formSelectContainer)}
          inputStyle={(selectStyles.input, styles.formSelectInput)}
          onChange={this.handleHubSubscribe}
          isSearchable={true}
          placeholder={"Subscribe to a hub"}
        />
      </div>
    );
  }

  buildHubOptions = (hubs) => {
    return (
      hubs &&
      hubs.map((hub) => {
        let hubName = hub.name
          .split(" ")
          .map((el) => {
            return el[0].toUpperCase() + el.slice(1);
          })
          .join(" ");
        return {
          value: hub.id,
          label: hubName,
        };
      })
    );
  };

  handleHubOnChange = (id, newHubList) => {
    let prevState = this.props.subscribedHubs;

    if (newHubList.length > prevState.length) {
      let newHub = newHubList[newHubList.length - 1];
      this.handleHubSubscribe(newHub);
    } else {
      let removedHub = this.detectRemovedHub(prevState, newHubList);
      this.confirmUnsubscribe(removedHub);
    }
  };

  handleHubSubscribe = (hub) => {
    let { hubState } = this.props;

    subscribeToHub(hub.value)
      .then((res) => {
        this.props.dispatch(HubActions.updateHub(hubState, { ...res }));
        this.props.dispatch(MessageActions.setMessage("Subscribed!"));
        this.props.dispatch(MessageActions.showMessage({ show: true }));
      })
      .catch(this.displayError);
  };

  detectRemovedHub = (prevState, newState) => {
    var cache = {};
    prevState.forEach((hub) => {
      cache[hub.id] = hub;
    });

    for (var i = 0; i < newState.length; i++) {
      var id = newState[i].value;
      if (cache[id]) {
        delete cache[id];
      }
    }

    return Object.values(cache)[0];
  };

  renderContentSubscriptions = () => {
    return contentSubscriptionOptions.map((option) => {
      return (
        <div className={css(styles.checkboxEntry)}>
          <div className={css(styles.checkboxLabel)} id={"checkbox-label"}>
            {option.label}
          </div>
          <Toggle
            key={option.id}
            className={"react-toggle"}
            defaultChecked={this.state[option.id]}
            checked={this.state[option.id]}
            disabled={this.state.isOptedOut}
            id={option.id}
            onChange={this.handleContentSubscribe}
          />
        </div>
      );
    });
  };

  handleContentSubscribe = (e) => {
    e && e.preventDefault();
    let id = e.target.id;
    let nextActiveState = e.target.checked;
    const startingActiveState = this.state[id];

    this.setState({
      [id]: nextActiveState,
    });

    const data = buildSubscriptionPatch(id, nextActiveState);
    updateEmailPreference(this.state.emailRecipientId, data)
      .then(() => {
        this.props.dispatch(MessageActions.setMessage("Saved!"));
        this.props.dispatch(MessageActions.showMessage({ show: true }));
      })
      .catch((err) => {
        this.displayError(err);
        this.setState({
          [id]: startingActiveState,
        });
      });
  };

  renderOptOut = () => {
    return (
      <div className={css(styles.checkboxEntry)}>
        <div className={css(styles.checkboxLabel, styles.optOut)}>
          {"Opt out of all email updates"}
        </div>
        <Toggle
          key={"optOut"}
          defaultChecked={this.state.isOptedOut}
          checked={this.state.isOptedOut}
          className={"react-toggle"}
          active={this.state.isOptedOut}
          // label={"Opt out of all email updates"}
          id={"optOut"}
          onChange={this.handleOptOut}
        />
      </div>
    );
  };

  handleOptOut = (e) => {
    let nextActiveState = e.target.checked;
    const startingActiveState = this.state.isOptedOut;
    this.setState({
      isOptedOut: nextActiveState,
    });

    const data = emailPreferencePatch({ isOptedOut: nextActiveState });
    updateEmailPreference(this.state.emailRecipientId, data)
      .then(() => {
        this.props.dispatch(MessageActions.setMessage("Saved!"));
        this.props.dispatch(MessageActions.showMessage({ show: true }));
      })
      .catch((err) => {
        this.displayError(err);
        this.setState({
          isOptedOut: startingActiveState,
        });
      });
  };

  displayError = (err) => {
    this.props.dispatch(
      MessageActions.setMessage("Oops! Something went wrong.")
    );
    this.props.dispatch(
      MessageActions.showMessage({ show: true, error: true })
    );
  };

  render() {
    return (
      <ComponentWrapper>
        <div className={css(styles.settingsPage)}>
          <div className={css(defaultStyles.title, styles.title)}>
            Email Settings
          </div>
          {this.renderPrimaryEmail()}
          {this.renderFrequencySelect()}
          {this.renderSubscribedHubs()}
          {/* {this.renderHubSelect()} */}

          <div className={css(styles.container)}>
            <div className={css(styles.listLabel)} id={"hubListTitle"}>
              {"Notifications"}
            </div>
            {this.renderContentSubscriptions()}
            {this.renderOptOut()}
          </div>
        </div>
      </ComponentWrapper>
    );
  }
}

const styles = StyleSheet.create({
  settingsPage: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    paddingTop: 30,
  },
  title: {
    paddingBottom: 10,
    letterSpacing: 1.1,
    fontWeight: 500,
  },
  subtitle: {
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    fontSize: 22,
    paddingBottom: 10,
    "@media only screen and (max-width: 1343px)": {
      fontWeight: 500,
      fontSize: 22,
    },
  },
  labelContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listLabel: {
    textTransform: "uppercase",
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: 1.2,
    marginBottom: 15,
    textAlign: "left",
    color: colors.BLACK(),
    transition: "all ease-out 0.1s",
    boxSizing: "border-box",
  },
  container: {
    padding: "15px 10px",
    borderTop: "1px solid #EDEDED",
    transition: "all ease-in-out 0.2s",
  },
  formSelectContainer: {
    padding: 0,
    margin: 0,
    width: "100%",
  },
  formSelectInput: {
    width: "100%",
  },
  multiTagStyle: {
    margin: "5px 0",
    marginRight: 5,
    border: "1px solid #fff",
    padding: "5px 8px",
    ":hover": {
      border: `1px solid ${colors.BLUE()}`,
    },
  },
  multiTagLabelStyle: {
    color: colors.PURPLE(1),
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  formContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  currentValue: {},
  primaryEmail: {
    width: "100%",
    transition: "all ease-in-out 0.1s",
    fontSize: 16,
    fontWeight: 300,
  },
  blurTransition: {
    filter: "blur(4px)",
  },
  emailIcon: {
    marginRight: 10,
    color: "#707378",
  },
  saveIcon: {
    height: 32,
    width: 32,
    fontSize: 12,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: colors.BLUE(),
    color: "#FFF",
    marginLeft: 15,
  },
  editIcon: {
    cursor: "pointer",
    // padding: 8,
    borderRadius: "50%",
    color: "#afb5bc",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 32,
    width: 32,
    ":hover": {
      color: colors.BLACK(),
      backgroundColor: "#EDEDED",
    },
  },
  emailInputContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: 5,
  },
  emailInputStyles: {
    padding: 0,
    margin: 0,
    minHeight: "unset",
    // width: '100%'
    width: "calc(100% - 32px)",
  },
  emailInput: {
    width: "100%",
  },
  hubsList: {
    width: "100%",
    boxSizing: "border-box",
    padding: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    "@media only screen and (max-width: 1303px)": {
      padding: 0,
    },
  },
  hubEntry: {
    display: "flex",
    justifyContent: "space-between",
    boxSizing: "border-box",
    marginBottom: 5,
    backgroundColor: "rgb(237, 238, 254)",
    color: colors.PURPLE(1),
    fontWeight: 500,
    textTransform: "uppercase",
    padding: "8px 12px",
    border: "1px solid #fff",
    letterSpacing: 1,
    fontSize: 12,
    marginRight: 5,
    width: "unset",
    ":hover": {
      backgroundColor: "rgb(237, 238, 254)",
      borderColor: colors.BLUE(),
    },
  },
  hubName: {
    color: colors.BLUE(),
    textTransform: "capitalize",
  },
  closeIcon: {
    cursor: "pointer",
    color: colors.BLACK(),
    borderRadius: "50%",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
    ":hover": {
      color: "#3f85f7",
    },
  },
  checkboxEntry: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: 300,
  },
  optOut: {
    fontWeight: 400,
  },
  addIcon: {
    fontSize: 18,
    marginRight: 3,
    ":hover": {
      backgroundColor: "#fff",
    },
  },
});

const mapStateToProps = (state) => ({
  ...state.hubs,
  hubState: state.hubs,
  user: state.auth.user,
});

export default connect(
  mapStateToProps,
  null
)(withAlert()(UserSettings));
