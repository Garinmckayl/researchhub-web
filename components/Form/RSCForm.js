import React from "react";
import { useStore, useDispatch } from "react-redux";
import { StyleSheet, css } from "aphrodite";

import AuthorAvatar from "~/components/AuthorAvatar";
import "~/components/stylesheets/RSCForm.css";

// Config
import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import colors from "~/config/themes/colors";
import {
  onKeyDownNumInput,
  onPasteNumInput,
  formatBalance,
} from "~/config/utils";

const AmountInput = (props) => {
  const store = useStore();

  return (
    <div
      className={css(
        styles.container,
        props.containerStyles && props.containerStyles
      )}
    >
      <span className={css(styles.label)}>
        Amount
        <span className={css(styles.asterick)}>*</span>
      </span>
      <div
        className={css(
          styles.inputContainer,
          props.inputContainerStyles && props.inputContainerStyles
        )}
      >
        <input
          className={
            css(styles.input, props.inputStyles && props.inputStyles) +
            " rscInput"
          }
          type="number"
          min={props.minValue ? props.minValue : 1}
          max={
            props.maxValue
              ? props.maxValue
              : store.getState().auth.user.balance || 0
          }
          pattern="[0-9]"
          value={props.value}
          onChange={props.onChange}
          onKeyDown={onKeyDownNumInput}
          onPaste={onPasteNumInput}
        />
        {!props.rightAlignBalance && (
          <img
            className={css(styles.rscIcon)}
            src={"/static/icons/coin-filled.png"}
          />
        )}
      </div>
      <div
        className={css(
          styles.balanceContainer,
          props.rightAlignBalance && styles.rightAlignBalance,
          props.hideBalance && styles.hideBalance
        )}
      >
        <span className={css(styles.balanceLabel)}>Available:</span>
        <span className={css(styles.balance)}>
          {formatBalance(store.getState().auth.user.balance)}
        </span>
        {props.rightAlignBalance && (
          <img
            className={css(styles.rscIcon, styles.mobileIcon)}
            src={"/static/icons/coin-filled.png"}
          />
        )}
      </div>
    </div>
  );
};

const RecipientInput = (props) => {
  if (!props.author) return null;

  const { first_name, last_name } = props.author;

  return (
    <div
      className={css(
        styles.container,
        props.containerStyles && props.containerStyles
      )}
    >
      <span className={css(styles.label)}>Recipient</span>
      <div
        className={css(
          styles.recipientCard,
          props.cardStyles && props.cardStyles
        )}
      >
        <AuthorAvatar author={props.author} size={30} />
        {(first_name || last_name) && (
          <span className={css(styles.recipientName) + " clamp1"}>
            {`${first_name} ${last_name}`}
          </span>
        )}
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    color: colors.BLACK(),
  },
  label: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 10,
    lineSpacing: 1.2,
  },
  asterick: {
    color: colors.BLUE(),
    marginLeft: 3,
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    height: 55,
    width: 100,
    fontSize: 20,
    fontWeight: "bold",
    padding: "5px 5px 5px 10px",
    boxSizing: "border-box",
    color: colors.BLACK(0.9),
    background: "#FBFBFD",
    border: "1px solid #E8E8F2",
    borderRadius: 2,
  },
  rscIcon: {
    marginLeft: 10,
    height: 25,
    borderRadius: "50%",
    boxShadow: "0px 2px 4px rgba(185, 185, 185, 0.25)",
  },
  mobileIcon: {
    marginLeft: 5,
    height: 20,
    borderRadius: "50%",
    boxShadow: "0px 2px 4px rgba(185, 185, 185, 0.25)",
  },
  rightAlignBalance: {
    width: "100%",
    justifyContent: "flex-end",
  },
  balanceContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: 10,
  },
  hideBalance: {
    display: "none",
  },
  balanceLabel: {
    color: colors.BLACK(0.6),
    fontSize: 14,
    fontWeight: 500,
  },
  balance: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.BLACK(0.9),
    marginLeft: 8,
  },
  recipientCard: {
    display: "flex",
    alignItems: "center",
    height: 55,
    width: 300,
    padding: 10,
    boxSizing: "border-box",
    color: colors.BLACK(0.9),
    background: "#FBFBFD",
    border: "1px solid #E8E8F2",
    borderRadius: 2,
    cursor: "pointer",
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.BLACK(),
    marginLeft: 10,
    "@media only screen and (max-width: 415px)": {
      fontSize: 16,
    },
  },
});

export { AmountInput, RecipientInput };
