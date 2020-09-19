import React, { Fragment } from "react";
import { connect } from "react-redux";
import { StyleSheet, css } from "aphrodite";

// Component
import VoteWidget from "../VoteWidget";
import ThreadActionBar from "./ThreadActionBar";
import DiscussionPostMetadata from "../DiscussionPostMetadata";
import ThreadTextEditor from "./ThreadTextEditor";

// Config
import colors from "~/config/themes/colors";
import { UPVOTE, DOWNVOTE } from "~/config/constants";
import { getNestedValue } from "~/config/utils";

// Redux
import DiscussionActions from "../../redux/discussion";
import { createUsername } from "../../config/utils";
import { MessageActions } from "~/redux/message";

class ReplyEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elementHeight: 0,
      collapsed: false,
      highlight: false,
      score: 0,
      selectedVoteType: "",
      // Removed
      removed: false,
      // Edit
      canEdit: false,
      editing: false,
      // Response
      isResponse: false,
    };
    this.replyRef = null;
  }

  componentDidMount() {
    const selectedVoteType = getNestedValue(this.props, [
      "reply",
      "userVote",
      "voteType",
    ]);
    const score = this.props.reply.score;

    this.setState(
      {
        score,
        selectedVoteType,
        highlight: this.props.reply.highlight && true,
        removed: this.props.reply.isRemoved,
        canEdit:
          this.props.auth &&
          this.props.auth.user.id === this.props.reply.createdBy.id,
      },
      () => {
        setTimeout(() => this.calculateThreadHeight(), 400);
        this.props.reply.highlight &&
          setTimeout(() => {
            this.setState({ highlight: false }, () => {
              this.props.reply.highlight = false;
            });
            this.calculateThreadHeight();
          }, 10000);
      }
    );
  }

  componentDidUpdate(prevProps) {
    this.calculateThreadHeight();
    if (prevProps.auth !== this.props.auth) {
      let { auth, reply } = this.props;
      this.setState({
        canEdit: auth.user.id === reply.createdBy.id,
      });
    }
  }

  calculateThreadHeight = () => {
    if (this.replyRef) {
      if (this.replyRef.clientHeight !== this.state.elementHeight) {
        this.setState({
          elementHeight: this.replyRef.clientHeight,
        });
      }
    }
    this.props.calculateThreadHeight();
  };

  formatMetaData = () => {
    let { data, comment, reply } = this.props;
    return {
      threadId: data.id,
      commentId: comment.id,
      paperId: data.paper,
      replyId: reply.id,
      userFlag: reply.userFlag,
    };
  };

  handleStateRendering = () => {
    if (this.state.removed) {
      return false;
    }
    if (!this.state.collapsed) {
      return true;
    }
  };

  toggleCollapsed = (e) => {
    e && e.stopPropagation();
    this.setState({ collapsed: !this.state.collapsed });
  };

  toggleEdit = () => {
    this.setState({ editing: !this.state.editing }, () => {
      this.calculateThreadHeight();
    });
  };

  removePostUI = () => {
    this.setState({ removed: true }, () => {
      //Todo: clean this part of code, temp use
      this.props.reply.isRemoved = true;
    });
  };

  upvote = async () => {
    let { data, comment, reply, postUpvote, postUpvotePending } = this.props;
    let discussionThreadId = data.id;
    let paperId = data.paper;
    let commentId = comment.id;
    let replyId = reply.id;

    postUpvotePending();

    await postUpvote(paperId, discussionThreadId, commentId, replyId);

    this.updateWidgetUI();
  };

  downvote = async () => {
    let {
      data,
      comment,
      reply,
      postDownvote,
      postDownvotePending,
    } = this.props;
    let discussionThreadId = data.id;
    let paperId = data.paper;
    let commentId = comment.id;
    let replyId = reply.id;

    postDownvotePending();

    await postDownvote(paperId, discussionThreadId, commentId, replyId);

    this.updateWidgetUI();
  };

  updateWidgetUI = () => {
    let voteResult = this.props.vote;
    const success = voteResult.success;
    const vote = getNestedValue(voteResult, ["vote"], false);

    if (success) {
      const voteType = vote.voteType;
      let score = this.state.score;
      if (voteType === UPVOTE) {
        if (voteType) {
          if (this.state.selectedVoteType === null) {
            score += 1;
          } else {
            score += 2;
          }
        } else {
          score += 1;
        }
        this.setState({
          selectedVoteType: UPVOTE,
          score,
        });
      } else if (voteType === DOWNVOTE) {
        if (voteType) {
          if (this.state.selectedVoteType === null) {
            score -= 1;
          } else {
            score -= 2;
          }
        } else {
          score -= 1;
        }
        this.setState({
          selectedVoteType: DOWNVOTE,
          score,
        });
      }
    }
  };

  submitReply = async (text, plain_text, callback) => {
    let {
      data,
      comment,
      postReply,
      postReplyPending,
      setMessage,
      showMessage,
      discussionCount,
      setCount,
    } = this.props;
    let paperId = data.paper;
    let discussionThreadId = data.id;
    let commentId = comment.id;

    postReplyPending();
    await postReply(paperId, discussionThreadId, commentId, text, plain_text);
    if (this.props.discussion.donePosting && this.props.discussion.success) {
      callback && callback();
      this.props.onReplySubmitCallback();
    } else {
      callback && callback();
    }
  };

  saveEditsReply = async (text, plain_text, callback) => {
    let {
      data,
      comment,
      reply,
      updateReply,
      updateReplyPending,
      showMessage,
      setMessage,
    } = this.props;
    let paperId = data.paper;
    let discussionThreadId = data.id;
    let commentId = comment.id;
    let replyId = reply.id;

    updateReplyPending();
    await updateReply(
      paperId,
      discussionThreadId,
      commentId,
      replyId,
      text,
      plain_text
    );
    if (this.props.discussion.doneUpdating && this.props.discussion.success) {
      setMessage("Comment successfully updated!");
      showMessage({ show: true });
      callback();
      this.setState({ editing: false }, () => {
        this.calculateThreadHeight();
      });
    } else {
      setMessage("Something went wrong");
      showMessage({ show: true, error: true });
    }
  };

  formatBody = () => {
    return this.props.reply.text;
  };

  checkForExistingQuote = (delta) => {
    let quoteBlock = delta.ops[1];
    return (
      quoteBlock &&
      quoteBlock.insert === "\n" &&
      quoteBlock.attributes &&
      quoteBlock.attributes.blockquote
    );
  };

  createQuoteText = (parentDelta) => {
    let quoteText = "",
      maxLength = 255;

    for (var i = 0; i < parentDelta.ops.length; i++) {
      if (typeof parentDelta.ops[i].insert === "string") {
        quoteText += parentDelta.ops[i].insert;
      }
    }

    let trimmedText = quoteText.replace(/\n/g, " ");

    if (maxLength < trimmedText.length) {
      trimmedText = trimmedText.substr(0, maxLength + 1);
      trimmedText =
        trimmedText.substr(
          0,
          Math.min(trimmedText.length, trimmedText.lastIndexOf(" "))
        ) + "...";
    }

    return trimmedText;
  };

  formatQuoteBlock = () => {
    let delta = JSON.parse(JSON.stringify(this.props.reply.text));
    if (delta.ops) {
      if (this.checkForExistingQuote(delta)) {
        delta.ops = delta.ops.slice(2); // remove existing quote (for extra nested replies)
      }

      delta.ops = [
        {
          insert: this.createQuoteText(delta),
        },
      ];

      delta.ops.push({
        insert: "\n",
        attributes: {
          blockquote: true,
        },
      });
      delta.ops.push({
        insert: "\n",
      });
    }

    return delta;
  };

  render() {
    const { hostname, mobileView, reply } = this.props;
    let dataCount = 0; // set to 0 for now; replies can't be replied to
    let date = reply.createdDate;
    let body = this.formatBody();
    let username = createUsername(reply);
    let metaIds = this.formatMetaData();
    const flexStyle = StyleSheet.create({
      threadline: {
        height: this.state.elementHeight - 58,
        width: 2,
        backgroundColor: "#EEEFF1",
        cursor: "pointer",
        ":hover": {
          backgroundColor: colors.BLUE(1),
        },
      },
    });

    return (
      <div
        className={css(styles.row, styles.replyCard)}
        ref={(element) => (this.replyRef = element)}
        onClick={() =>
          this.setState({ elementHeight: this.replyRef.clientHeight })
        }
      >
        <div className={css(styles.column, styles.left)}>
          <div>
            <VoteWidget
              styles={styles.voteWidget}
              score={this.state.score}
              onUpvote={this.upvote}
              onDownvote={this.downvote}
              selected={this.state.selectedVoteType}
              fontSize={"12px"}
              width={"40px"}
              type={"Reply"}
              promoted={false}
            />
          </div>
          {this.handleStateRendering() && (
            <div className={css(flexStyle.threadline)}></div>
          )}
        </div>
        <div className={css(styles.column, styles.metaData)}>
          <span
            className={css(
              styles.highlight,
              this.state.highlight && styles.active,
              this.state.removed && styles.noPadding
            )}
          >
            {!this.state.removed && (
              <div className={css(styles.row, styles.topbar)}>
                <DiscussionPostMetadata
                  authorProfile={getNestedValue(reply, [
                    "createdBy",
                    "authorProfile",
                  ])}
                  username={username}
                  date={date}
                  smaller={true}
                  onHideClick={!mobileView && this.toggleCollapsed}
                  hideState={this.state.collapsed}
                  dropDownEnabled={true}
                  // Moderator
                  metaData={metaIds}
                  onRemove={this.removePostUI}
                />
              </div>
            )}
            {this.handleStateRendering() ? (
              <Fragment>
                <div className={css(styles.content)}>
                  <ThreadTextEditor
                    readOnly={true}
                    initialValue={body}
                    body={true}
                    onChange={this.calculateThreadHeight}
                    editing={this.state.editing}
                    onEditCancel={this.toggleEdit}
                    onEditSubmit={this.saveEditsReply}
                    textStyles={styles.commentEditor}
                  />
                </div>
                <div className={css(styles.row, styles.bottom)}>
                  <ThreadActionBar
                    hostname={hostname}
                    count={dataCount}
                    comment={true}
                    small={true}
                    calculateThreadHeight={this.calculateThreadHeight}
                    isRemoved={this.state.removed}
                    editing={this.state.editing}
                    toggleEdit={this.state.canEdit && this.toggleEdit}
                    onSubmit={this.submitReply}
                    initialValue={this.formatQuoteBlock()}
                    hasHeader={true}
                    hideCount={true}
                  />
                </div>
              </Fragment>
            ) : (
              <div className={css(styles.content)}>
                {this.state.removed && (
                  <div className={css(styles.removedText)}>
                    Comment Removed By Moderator
                  </div>
                )}
              </div>
            )}
          </span>
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    height: "100%",
  },
  left: {
    alignItems: "center",
    width: 40,
  },
  replyCard: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 5,
    overflow: "visible",
    cursor: "pointer",
    "@media only screen and (max-width: 415px)": {
      justifyContent: "space-between",
    },
  },
  topbar: {
    width: "100%",
    margin: "15px 0px 5px 0",
    justifyContent: "flex-start",
    alignItems: "center",
    "@media only screen and (max-width: 415px)": {
      marginTop: 12,
    },
  },
  content: {
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
    overflowWrap: "break-word",
    lineHeight: 1.6,
    "@media only screen and (max-width: 415px)": {
      marginTop: 10,
      marginBottom: 10,
    },
  },
  metaData: {
    boxSizing: "border-box",
    width: "100%",
    marginLeft: 5,
    "@media only screen and (max-width: 415px)": {
      width: "calc(100% - 35px)",
    },
  },
  highlight: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 5,
    padding: "0px 10px 10px 8px",
    ":hover": {
      backgroundColor: "#FAFAFA",
    },
    "@media only screen and (max-width: 767px)": {
      paddingLeft: 5,
      paddingRight: 5,
      paddingBottom: 5,
    },
    "@media only screen and (max-width: 415px)": {
      paddingRight: 0,
    },
  },
  active: {
    backgroundColor: colors.LIGHT_YELLOW(),
    ":hover": {
      backgroundColor: colors.LIGHT_YELLOW(),
    },
  },
  bottom: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    margin: 0,
    padding: 0,
    fontSize: 20,
  },
  body: {
    margin: 0,
  },
  voteWidget: {
    margin: 0,
    backgroundColor: "#FFF",
    "@media only screen and (max-width: 415px)": {
      width: 35,
    },
  },
  removedText: {
    fontStyle: "italic",
    fontSize: 13,
  },
  noPadding: {
    paddingBottom: 0,
  },
  commentEditor: {
    fontSize: 16,
    "@media only screen and (max-width: 767px)": {
      fontSize: 14,
    },
    "@media only screen and (max-width: 415px)": {
      fontSize: 12,
    },
  },
});

const mapStateToProps = (state) => ({
  discussion: state.discussion,
  vote: state.vote,
  auth: state.auth,
});

const mapDispatchToProps = {
  postReply: DiscussionActions.postReply,
  postReplyPending: DiscussionActions.postReplyPending,
  postUpvotePending: DiscussionActions.postUpvotePending,
  postUpvote: DiscussionActions.postUpvote,
  postDownvotePending: DiscussionActions.postDownvotePending,
  postDownvote: DiscussionActions.postDownvote,
  updateReply: DiscussionActions.updateReply,
  updateReplyPending: DiscussionActions.updateReplyPending,
  setMessage: MessageActions.setMessage,
  showMessage: MessageActions.showMessage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReplyEntry);
