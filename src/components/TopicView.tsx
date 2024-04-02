import { useEffect, useState } from 'react';
import {
  FaCaretDown,
  FaCaretUp,
  FaCheck,
  FaClock,
  FaEdit,
  FaFlag,
  FaGithub,
  FaInfinity,
  FaJira,
  FaRegCheckCircle,
  FaRegDotCircle,
  FaRegPlayCircle,
  FaRegTimesCircle,
  FaShare,
  FaTimes,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import tw from 'twin.macro';
import { useBreakpoint } from '../hooks/useBreakpoint';
import useIdentity from '../hooks/useIdentity';
import {
  Topic,
  TopicInfo,
  TopicStatus,
  VoteStatus,
  useTopicStore,
} from '../stores/topicStore';
import { handleInfo, handlePromise } from '../utils/handlers';
import { promptModMessage } from '../utils/promptModMessage';
import Markdown from './Markdown';
import StatusTag from './StatusTag';
import Tag from './Tag';
import Tooltip from './Tooltip';
import TopicForm from './TopicForm';
import TopicTag from './TopicTag';
import { Join } from './utils/Join';

const ToolbarButton = tw.div`flex items-center gap-2 font-bold px-4 py-2 text-sm rounded-full cursor-pointer border-2 bg-[#fff8] border-gray-300 hover:bg-[rgba(0,0,0,.05)]`;

export interface TopicViewProps {
  topic: Topic;
  expanded?: boolean;
  onChangeExpanded?(expanded: boolean): void;
  hideModerationInfo?: boolean;
}

export default function TopicView({
  topic,
  expanded,
  onChangeExpanded,
  hideModerationInfo,
}: TopicViewProps) {
  const [editing, setEditing] = useState(false);
  const edit = useTopicStore((state) => state.edit);
  const setStatus = useTopicStore((state) => state.setStatus);
  const setModStatus = useTopicStore((state) => state.setModStatus);
  const breakpoint = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useIdentity();
  const vote = useTopicStore((state) => state.vote);

  const isMobile = breakpoint === 'xs';
  const maxPreviewTags = isMobile || expanded ? 0 : 2;

  useEffect(() => {
    if (!expanded) {
      setEditing(false);
    }
  }, [expanded]);

  const onVote = (voteStatus: VoteStatus) => {
    if (!user) {
      return handleInfo('Please sign in to vote.');
    }
    handlePromise(
      vote(topic, voteStatus),
      // voteStatus === 1
      //   ? 'Upvoting...'
      //   : voteStatus === -1
      //   ? 'Downvoting...'
      //   : 'Removing vote...',
      undefined,
      'Error occurred while voting!',
    );
  };

  const onChangeStatus = (topic: Topic, status: TopicStatus) => {
    handlePromise(
      setStatus(topic.id, status),
      // 'Changing status...',
      undefined,
      'Error while changing status!',
    );
  };

  const onSubmitEdit = (info: TopicInfo) => {
    /* await */ handlePromise(
      edit(topic.id, info),
      'Saving changes...',
      'Error while saving topic!',
    );
    setEditing(false);
  };

  return (
    <div
      tw="bg-gray-100 rounded-2xl [box-shadow: 0 4px .5rem #0005]"
      css={
        topic.modStatus === 'pending'
          ? tw`border-[4px] border-teal-500`
          : topic.modStatus === 'rejected'
          ? tw`border-[4px] border-orange-500`
          : null
      }
    >
      <div
        tw="p-3 text-lg flex items-center gap-4 rounded-2xl"
        css={[
          onChangeExpanded && tw`cursor-pointer hover:bg-[rgba(0,0,0,.05)]`,
        ]}
        onClick={() => onChangeExpanded?.(!expanded)}
      >
        <>
          <div
            tw="flex items-center gap-2"
            css={[onChangeExpanded && tw`cursor-default select-none`]}
            onClick={(e) => e.stopPropagation()}
          >
          </div>
        </>
      </div>
      {!!expanded && (
        <div tw="px-5 pt-3 pb-4 ">
          {editing ? (
            <TopicForm initial={topic} onSubmit={onSubmitEdit} />
          ) : (
            <Join separator={() => <hr tw="my-3" />}>
              {!!topic.description && (
                <div tw="overflow-x-hidden">
                  <Markdown>{topic.description}</Markdown>
                </div>
              )}
              {topic.links.length > 0 && (
                <div>
                  {topic.links.map((link, i) => (
                    <div key={i} tw="flex gap-2 items-center">
                      {!!link.startsWith('https://dfinity.atlassian.net/') && (
                        <FaJira tw="text-blue-500" />
                      )}
                      {!!link.startsWith('https://github.com/') && (
                        <FaGithub tw="text-black" />
                      )}
                      {!!link.startsWith('https://forum.dfinity.org/') && (
                        <FaInfinity tw="text-purple-500" />
                      )}
                      <a
                        tw="text-blue-500 text-ellipsis overflow-hidden whitespace-nowrap"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              {!!(topic.isEditable && topic.modMessage) && (
                <div tw="">
                  <div tw="flex gap-2">
                    <FaTimes tw="text-red-600 translate-y-[3px]" />
                    <div tw="font-bold">Moderator note:</div>
                    <div tw="opacity-75">{topic.modMessage}</div>
                  </div>
                </div>
              )}
            </Join>
          )}
        </div>
      )}
    </div>
  );
}
