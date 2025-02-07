// @ts-nocheck
import React, { ReactElement } from "react";
import { StyleSheet, css } from "aphrodite";
import CheckBox from "./Form/CheckBox";

export type ResearchhubOptionCardProps = {
  description: string;
  header: string;
  imgSrc: string;
  isActive: boolean;
  isCheckboxSquare: boolean;
  onSelect: Function;
};

export default function ResearchhubOptionCard({
  description,
  header,
  imgSrc,
  isActive,
  isCheckboxSquare,
  onSelect,
}: ResearchhubOptionCardProps): ReactElement<"div"> {
  return (
    <div
      className={css(styles.largeListItem, styles.clickable)}
      onClick={onSelect}
    >
      <div className={css(styles.checkboxAligner)}>
        <CheckBox isSquare={isCheckboxSquare} active={isActive} />
      </div>
      <div className={css(styles.mediaContainer)}>
        <div className={css(styles.mediaContent)}>
          <div className={css(styles.mediaHeader)}> {header} </div>
          <div className={css(styles.mediaDescription)}> {description} </div>
        </div>
        <div className={css(styles.mediaImgBox)}>
          <img
            src={imgSrc}
            className={css(styles.mediaImg)}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    display: "flex",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  mediaContent: {
    display: "flex",
    flexDirection: "column",
    width: "373px",
    "@media only screen and (max-width: 767px)": {
      width: "100%",
    },
  },
  mediaHeader: {
    display: "flex",
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "21px",
    color: "#241F3A",
  },
  mediaDescription: {
    display: "flex",
    fontWeight: "normal",
    fontSize: "14px",
    lineHeight: "22px",
    color: "#241F3A",
    opacity: 0.7,
    marginTop: "10px",
    width: "373px",
    "@media only screen and (max-width: 767px)": {
      width: "100%",
    },
  },
  mediaImgBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "75px",
    height: "75px",
    borderRadius: "4px",
    backgroundColor: "rgba(57, 113, 255, 0.07)",
    marginLeft: "25px",
  },
  mediaImg: {},
  largeListItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    borderRadius: "4px",
    backgroundColor: "#FAFAFA",
    border: "1.5px solid #F0F0F0",
    margin: "5px 0px",
    padding: "20px",
  },
  clickable: {
    cursor: "pointer",
    userSelect: "none",
  },
  checkboxAligner: {
    display: "flex",
    alignSelf: "stretch",
    paddingRight: "15px",
  },
  contentAligner: {
    display: "flex",
  },
});
