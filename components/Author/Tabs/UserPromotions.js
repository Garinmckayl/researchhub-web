import React, { Fragment, useState } from "react";
import { StyleSheet, css } from "aphrodite";
import { connect } from "react-redux";
import Ripples from "react-ripples";
import ReactPlaceholder from "react-placeholder";

// Components
import ComponentWrapper from "~/components/ComponentWrapper";
import PromotionCard from "./Promotions/PromotionCard";
import Loader from "~/components/Loader/Loader";
import PaperPlaceholder from "~/components/Placeholders/PaperPlaceholder";

import { AuthorActions } from "~/redux/author";

import colors from "~/config/themes/colors";
import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";

const UserPromotions = (props) => {
  const [loading, setLoading] = useState(false);

  const renderPromotions = () => {
    let { author, fetching } = props;
    if (fetching) {
      return (
        <Fragment>
          <div className={css(styles.card)}>
            <ReactPlaceholder
              ready={false}
              showLoadingAnimation
              customPlaceholder={<PaperPlaceholder color="#efefef" />}
            />
          </div>
          <div className={css(styles.card)}>
            <ReactPlaceholder
              ready={false}
              showLoadingAnimation
              customPlaceholder={<PaperPlaceholder color="#efefef" />}
            />
          </div>
        </Fragment>
      );
    }

    let promotions =
      author.promotions && author.promotions.results
        ? author.promotions.results
        : [];

    return promotions.map((promotion, i) => {
      const { source } = promotion;
      return <PromotionCard paper={source} promotion={promotion} index={i} />;
    });
  };

  const loadMore = () => {
    const { next, results } = props.author.promotions;
    setLoading(true);
    fetch(next, API.GET_CONFIG())
      .then(Helpers.checkStatus)
      .then(Helpers.parseJSON)
      .then((res) => {
        let obj = { ...res };
        obj.results = [...results, ...res.results];
        obj.count = obj.results.length;
        props.dispatch(
          AuthorActions.updateAuthorByKey({
            key: "promotions",
            value: obj,
            prevState: props.author,
          })
        );
        setLoading(false);
      });
  };

  const renderLoadMoreButton = () => {
    if (props.fetching) return;
    if (props.author && props.author.promotions) {
      let { next } = props.author.promotions;
      if (next !== null) {
        return (
          <div className={css(styles.buttonContainer)}>
            {!loading ? (
              <Ripples
                className={css(styles.loadMoreButton)}
                onClick={loadMore}
              >
                Load More Papers
              </Ripples>
            ) : (
              <Loader
                key={"paperLoader"}
                loading={true}
                size={25}
                color={colors.BLUE()}
              />
            )}
          </div>
        );
      }
    }
  };

  return (
    <ComponentWrapper>
      <div className={css(styles.feed)}>
        {renderPromotions()}
        {renderLoadMoreButton()}
      </div>
    </ComponentWrapper>
  );
};

const styles = StyleSheet.create({
  feed: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    height: 45,
    "@media only screen and (max-width: 768px)": {
      marginTop: 15,
      marginBottom: 15,
    },
  },
  loadMoreButton: {
    fontSize: 14,
    border: `1px solid ${colors.BLUE()}`,
    boxSizing: "border-box",
    borderRadius: 4,
    height: 45,
    width: 155,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: colors.BLUE(),
    cursor: "pointer",
    userSelect: "none",
    ":hover": {
      color: "#FFF",
      backgroundColor: colors.BLUE(),
    },
  },
  card: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 3,
  },
});

const mapStateToProps = (state) => ({
  auth: state.auth,
  author: state.author,
});

export default connect(
  mapStateToProps,
  null
)(UserPromotions);
