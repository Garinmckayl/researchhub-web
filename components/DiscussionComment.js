import { Fragment } from "react";

import { css, StyleSheet } from "aphrodite";
import Router from "next/router";
import { connect } from "react-redux";

import DiscussionCard from "~/components/DiscussionCard";
import { ReplyEditor } from "~/components/DiscussionCommentEditor";
import DiscussionPostMetadata from "~/components/DiscussionPostMetadata";
import EditAction from "~/components/EditAction";
import TextEditor from "~/components/TextEditor";
import VoteWidget from "~/components/VoteWidget";
import Loader from "~/components/Loader/Loader";

import DiscussionActions from "~/redux/discussion";

import { UPVOTE, DOWNVOTE } from "../config/constants";
import { voteWidgetIcons } from "~/config/themes/icons";
import colors, { discussionPageColors } from "~/config/themes/colors";
import {
  createUsername,
  doesNotExist,
  getCurrentUser,
  getNestedValue,
} from "~/config/utils";

class DiscussionComment extends React.Component {
  state = {
    id: this.props.data.id,
    date: this.props.data.createdDate,
    text: this.props.data.text,
    selectedVoteType: this.props.data.userVote.voteType,
    score: this.props.data.score,
    createdBy: this.props.data.createdBy,
    username: createUsername(this.props.data),
    readOnly: true,
    paperId: Router.query.paperId,
    discussionThreadId: Router.query.discussionThreadId,
  };

  componentDidUpdate(prevProps, prevState) {
    const selectedVoteType = getNestedValue(this.props, [
      "data",
      "userVote",
      "voteType",
    ]);
    if (selectedVoteType !== prevState.selectedVoteType) {
      this.setState({ selectedVoteType });
      // Force reset the replies so that they re-render
      this.setState({ replies: this.props.data.replies });
    }
  }

  createdByCurrentUser = () => {
    return this.state.createdBy.id === this.props.currentUser.id;
  };

  setReadOnly = (readOnly) => {
    this.setState({ readOnly });
  };

  upvote = async () => {
    const { paperId, discussionThreadId } = this.state;

    this.props.dispatch(DiscussionActions.postUpvotePending());

    const ids = [];
    if (this.props.commentId) {
      ids.push(this.props.commentId);
    }
    ids.push(this.state.id);

    await this.props.dispatch(
      DiscussionActions.postUpvote(paperId, discussionThreadId, ...ids)
    );

    this.updateWidgetUI(this.props.voteResult);
  };

  downvote = async () => {
    const { paperId, discussionThreadId } = this.state;

    this.props.dispatch(DiscussionActions.postDownvotePending());

    const ids = [];
    if (this.props.commentId) {
      ids.push(this.props.commentId);
    }
    ids.push(this.state.id);

    await this.props.dispatch(
      DiscussionActions.postDownvote(paperId, discussionThreadId, ...ids)
    );

    this.updateWidgetUI(this.props.voteResult);
  };

  updateWidgetUI = (voteResult) => {
    const success = voteResult.success;
    const vote = getNestedValue(voteResult, ["vote"], false);
    if (success) {
      const voteType = vote.voteType;
      if (voteType === UPVOTE) {
        this.setState({
          selectedVoteType: UPVOTE,
          score: this.state.score + 1,
        });
      } else if (voteType === DOWNVOTE) {
        this.setState({
          selectedVoteType: DOWNVOTE,
          score: this.state.score - 1,
        });
      }
    }
  };

  updateEditor = (updatedContent) => {
    if (updatedContent) {
      this.setState({ text: updatedContent.text }, () => {
        this.setReadOnly(true);
      });
    }
    return false;
  };

  renderTop = () => {
    return (
      <Fragment>
        <VoteWidget
          score={this.state.score}
          onUpvote={this.upvote}
          onDownvote={this.downvote}
          selected={this.state.selectedVoteType}
        />
        <DiscussionPostMetadata
          username={this.state.username}
          authorProfile={this.props.data.createdBy.authorProfile}
          date={this.state.date}
        />
      </Fragment>
    );
  };

  renderInfo = () => {
    return (
      <TextEditor
        classNames={[styles.commentEditor]}
        readOnly={this.state.readOnly}
        onSubmit={this.updateText}
        initialValue={this.state.text}
      />
    );
  };

  render() {
    const action = this.renderAction ? this.renderAction() : null;

    return (
      <div className={css(styles.commentContainer)}>
        <DiscussionCard
          top={this.renderTop()}
          info={this.renderInfo()}
          infoStyle={this.props.infoStyle}
          action={action}
        />
      </div>
    );
  }
}

class CommentClass extends DiscussionComment {
  constructor(props) {
    super(props);
    this.state.showReplyBox = false;
    this.state.replies = this.props.data.replies;
    this.state.replyCount = this.props.data.replyCount;
    this.state.toggleReplies = false;
    this.state.transition = false;
    this.state.loaded = false;
    this.state.windowPostion = null;
    this.ref = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleWindowScroll);
  }

  componentDidUpdate(prevProp) {
    if (prevProp !== this.props) {
      this.handleWindowScroll();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleWindowScroll);
  }

  handleWindowScroll = () => {
    this.setState({ windowPostion: window.pageYOffset });
  };

  updateText = async (text) => {
    this.props.dispatch(DiscussionActions.updateCommentPending());
    await this.props.dispatch(
      DiscussionActions.updateComment(
        this.state.paperId,
        this.state.discussionThreadId,
        this.state.id,
        text
      )
    );
    return this.updateEditor(this.props.updatedComment);
  };

  renderAction = () => {
    return (
      <div className={css(styles.actionBar)}>
        <ReplyEditor
          onCancel={() => this.setState({ showReplyBox: false })}
          onSubmit={this.addSubmittedReply}
          commentId={this.state.id}
        />
        {/* {this.createdByCurrentUser() && (
          <EditAction onClick={this.setReadOnly} />
        )} */}
        {this.renderReplies()}
      </div>
    );
  };

  addSubmittedReply = (reply) => {
    // if (!doesNotExist(reply)) {
    let newReplies = [reply];
    newReplies = newReplies.concat(this.state.replies);
    this.setState({
      replies: newReplies,
      toggleReplies: true,
    });
    // }
  };

  toggleReplies = () => {
    window.scrollTo(0, this.state.windowPostion);
    this.setState(
      {
        toggleReplies: !this.state.toggleReplies,
        transition: !this.state.loaded,
      },
      () => {
        setTimeout(() => {
          this.setState({ transition: false, loaded: true }, () => {
            // this.ref.current.scrollIntoView({
            //   behavior: 'smooth',
            //   block: 'start',
            // });
            window.scrollTo(0, this.state.windowPostion);
          });
        }, 400);
      }
    );
  };

  renderMessage = () => {
    if (this.state.toggleReplies) {
      return `Hide ${this.state.replyCount.length === 1 ? "reply" : "replies"}`;
    } else {
      return `View ${
        this.state.replyCount === 1
          ? `${this.state.replyCount} reply`
          : `${this.state.replyCount} replies`
      }`;
    }
  };

  renderReplies = () => {
    const replies =
      this.state.replies &&
      this.state.replies.map((r, i) => {
        return <Reply key={r.id} data={r} commentId={this.state.id} />;
      });

    if (replies.length > 0) {
      return (
        <Fragment>
          <div className={css(styles.showReplyContainer)}>
            <div className={css(styles.showReply)} onClick={this.toggleReplies}>
              <span className={css(styles.icon)}>
                {this.state.toggleReplies
                  ? voteWidgetIcons.upvote
                  : voteWidgetIcons.downvote}
              </span>
              {this.renderMessage()}
            </div>
          </div>
          <div
            className={css(
              styles.replyContainer,
              this.state.toggleReplies && styles.show
            )}
          >
            {this.state.transition ? <Loader /> : replies}
          </div>
        </Fragment>
      );
    }
  };
}

class ReplyClass extends DiscussionComment {
  constructor(props) {
    super(props);
  }

  updateText = async (text) => {
    this.props.dispatch(DiscussionActions.updateReplyPending());
    await this.props.dispatch(
      DiscussionActions.updateReply(
        this.state.paperId,
        this.state.discussionThreadId,
        this.props.commentId,
        this.state.id,
        text
      )
    );

    return this.updateEditor(this.props.updatedReply);
  };

  renderAction = () => {
    if (this.createdByCurrentUser()) {
      return (
        <div className={css(styles.actionBar)}>
          {/* <EditAction onClick={this.setReadOnly} /> */}
        </div>
      );
    }
  };
}

const mapStateToProps = (state) => {
  return {
    voteResult: state.vote,
    currentUser: getCurrentUser(state),
    updatedComment: state.discussion.updatedComment,
    updatedReply: state.discussion.updatedReply,
  };
};

export const Comment = connect(
  mapStateToProps,
  null
)(CommentClass);

export const Reply = connect(
  mapStateToProps,
  null
)(ReplyClass);

const styles = StyleSheet.create({
  commentContainer: {
    // paddingTop: "32px",
    // borderTop: `1px solid ${colors.GREY(1)}`,
    // borderBottom: `1px solid ${colors.GREY(1)}`
  },
  commentEditor: {
    minHeight: "100%",
    padding: "0px",
  },
  voteWidget: {
    marginRight: 18,
  },
  actionBar: {
    marginTop: 8,
    width: "100%",
  },
  reply: {
    cursor: "pointer",
    userSelect: "none",
  },
  divider: {
    borderBottom: "1px solid",
    display: "block",
    borderColor: discussionPageColors.DIVIDER,
  },
  showReplyContainer: {
    display: "flex",
    justifyContent: "flex-start",
  },
  replyContainer: {
    transition: "all ease-in-out 0.2s",
    height: 0,
    opacity: 0,
  },
  show: {
    height: "calc(100%)",
    overflow: "auto",
    opacity: 1,
  },
  showReply: {
    cursor: "pointer",
    userSelect: "none",
    color: colors.BLUE(1),
    fontSize: 15,
  },
  icon: {
    marginRight: 10,
  },
});
