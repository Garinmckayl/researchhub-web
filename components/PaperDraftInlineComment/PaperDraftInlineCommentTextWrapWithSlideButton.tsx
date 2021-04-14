import { css, StyleSheet } from "aphrodite";
import InlineCommentUnduxStore, {
  cleanupStoreAndCloseDisplay,
  findTargetInlineComment,
  getSavedInlineCommentsGivenBlockKeyAndThreadID,
  InlineCommentStore,
} from "./undux/InlineCommentUnduxStore";
import { formatTextWrapID } from "./util/PaperDraftInlineCommentUtil";
import PaperDraftStore from "../PaperDraft/undux/PaperDraftUnduxStore";
import Popover from "react-popover";
import React, {
  ReactElement,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
  useRef,
  RefObject,
} from "react";
import { BUTTON_HEIGHT } from "./PaperDraftInlineCommentSlideButton";
import { silentEmptyFnc } from "../PaperDraft/util/PaperDraftUtils";

type UseEffectPrepareSlideButtonArgs = {
  inlineCommentStore: InlineCommentStore;
  isBeingPrompted: boolean;
  setShouldInsertOffSetTop: (flag: boolean) => void;
  shouldInsertOffSetTop: boolean;
  textRef: RefObject<HTMLSpanElement>;
};

function useEffectPrepareSlideButton({
  inlineCommentStore,
  isBeingPrompted,
  setShouldInsertOffSetTop,
  shouldInsertOffSetTop,
  textRef,
}: UseEffectPrepareSlideButtonArgs): void {
  useEffect(() => {
    if (textRef != null && shouldInsertOffSetTop && isBeingPrompted) {
      const { offsetTop } = textRef.current || { offsetTop: 0 };
      inlineCommentStore.set("promptedEntityOffsetTop")(
        offsetTop - BUTTON_HEIGHT / 2
      );
      setShouldInsertOffSetTop(false);
    }
  }, [
    textRef,
    inlineCommentStore,
    shouldInsertOffSetTop,
    isBeingPrompted,
    setShouldInsertOffSetTop,
  ]);
}

export default function PaperDraftInlineCommentTextWrapWithSlideButton(
  {
    blockKey,
    children,
    contentState,
    decoratedText,
    entityKey,
  } /* Props passed down from draft-js. See documentations for decorators */
): ReactElement<"span"> {
  const [shouldInsertOffSetTop, setShouldInsertOffSetTop] = useState<boolean>(
    true
  );
  const inlineCommentStore = InlineCommentUnduxStore.useStore();
  const paperDraftStore = PaperDraftStore.useStore();
  const animatedEntityKey = inlineCommentStore.get("animatedEntityKey");
  const animatedTextCommentID = inlineCommentStore.get("animatedTextCommentID");
  const { commentThreadID } = contentState.getEntity(entityKey).getData();
  const isCommentSavedInBackend = commentThreadID != null;
  const doesCommentExistInStore =
    findTargetInlineComment({
      blockKey,
      commentThreadID,
      entityKey,
      store: inlineCommentStore,
    }) != null;

  const shouldTextBeHighlighted = useMemo<boolean>(
    (): boolean => doesCommentExistInStore || isCommentSavedInBackend,
    [doesCommentExistInStore, isCommentSavedInBackend]
  );
  const isCurrentCommentTextActive = useMemo<boolean>(
    (): boolean =>
      shouldTextBeHighlighted &&
      (animatedTextCommentID === commentThreadID ||
        animatedEntityKey === entityKey),
    [
      animatedEntityKey,
      animatedTextCommentID,
      commentThreadID,
      entityKey,
      shouldTextBeHighlighted,
    ]
  );
  const isBeingPrompted =
    inlineCommentStore.get("promptedEntityKey") === entityKey &&
    !inlineCommentStore.get("silencedPromptKeys").has(entityKey);
  const textRef = useRef<HTMLSpanElement>(null);
  useEffectPrepareSlideButton({
    inlineCommentStore,
    isBeingPrompted,
    setShouldInsertOffSetTop,
    shouldInsertOffSetTop,
    textRef,
  });

  const hidePrompterAndSilence = (event: SyntheticEvent): void => {
    event.stopPropagation;
    console.warn("hiding");
    cleanupStoreAndCloseDisplay({ inlineCommentStore });
    inlineCommentStore.set("silencedPromptKeys")(
      new Set([...inlineCommentStore.get("silencedPromptKeys"), entityKey])
    );
  };

  const openCommentThreadDisplay = (event): void => {
    if (isCommentSavedInBackend) {
      cleanupStoreAndCloseDisplay({
        inlineCommentStore,
      });
      inlineCommentStore.set("displayableInlineComments")(
        getSavedInlineCommentsGivenBlockKeyAndThreadID({
          blockKey,
          commentThreadID,
          editorState: paperDraftStore.get("editorState"),
        })
      );
      inlineCommentStore.set("animatedTextCommentID")(commentThreadID);
    }
  };

  return (
    <Popover
      body={<React.Fragment />}
      children={
        <span
          className={css(
            shouldTextBeHighlighted
              ? styles.commentTextHighLight
              : styles.textNonHighLight,
            isCurrentCommentTextActive ? styles.commentActiveHighlight : null
          )}
          id={
            commentThreadID != null
              ? formatTextWrapID(commentThreadID)
              : formatTextWrapID(entityKey)
          }
          key={`InlineCommentTextWrap-${entityKey}-${commentThreadID}`}
          onClick={openCommentThreadDisplay}
          ref={textRef}
          role="none"
        >
          {children}
        </span>
      }
      hideArrow={true}
      isOpen={true}
      key={`InlineCommentTextWrap-Context-${entityKey}`}
      onOuterAction={isBeingPrompted ? hidePrompterAndSilence : silentEmptyFnc}
    />
  );
}

const styles = StyleSheet.create({
  commentActiveHighlight: {
    backgroundColor: "rgb(140 230 180)",
    cursor: "pointer",
  },
  commentTextHighLight: {
    backgroundColor: "rgb(204 243 221)",
    cursor: "pointer",
  },
  popoverBodyStyle: {
    background: "rgb(0,0,0)",
    color: "rgb(255, 255, 255)",
    cursor: "pointer",
    fontSize: 14,
    padding: "8px 16px",
    borderRadius: 5,
  },
  textNonHighLight: {
    backgroundColor: "transparent",
  },
});
