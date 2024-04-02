import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import 'twin.macro';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  SEARCH_SORTS,
  SearchSort,
  Topic,
  TopicStatus,
  useTopicStore,
} from '../../stores/topicStore';
import { capitalize } from '../../utils/capitalize';
import { handleError } from '../../utils/handlers';
import TopicList from '../TopicList';

const filterStatuses: TopicStatus[] = ['open', 'next', 'completed', 'closed'];

const defaultFilterStates: Record<TopicStatus, boolean> = {
  open: true,
  next: true,
  completed: false,
  closed: false,
};

export default function BrowsePage() {
  const [filterStates, setFilterStates] = useState(defaultFilterStates);
  const [filterText, setFilterText] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const breakpoint = useBreakpoint();

  const topics = useTopicStore((state) => state.topics);
  const sort = useTopicStore((state) => state.sort);
  // const tags = useTopicStore((state) => state.tags);
  const navigate = useNavigate();

  const tag = searchParams.get('tag');

  const visibleTopics = topics.filter((topic: Topic) => {
    if (filterText) {
      // Show all topics matching the query regardless of other search params
      return topic.title.toLowerCase().includes(filterText.toLowerCase());
    }
    if (tag && !topic.tags.includes(tag)) {
      return false;
    }
    return !!filterStates[topic.status];
  });

  useEffect(() => {
    const id = searchParams.get('topic');
    if (id && id === String(+id) && !topics.some((t) => t.id === id)) {
      navigate(`/topic/${id}`);
    }
  }, [navigate, searchParams, topics]);

  // useEffect(() => {
  //   search().catch((err) => handleError(err, 'Error while fetching topics!'));
  // }, [search]);

  const onChangeSort = useCallback(
    (sort: SearchSort) => {
      useTopicStore.setState({ sort });
      useTopicStore
        .getState()
        .search()
        .catch((err) =>
          handleError(err, 'Error while updating search results!'),
        );
      searchParams.set('sort', sort);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam && sortParam !== sort && SEARCH_SORTS.includes(sortParam)) {
      onChangeSort(sortParam as SearchSort);
    }
  }, [onChangeSort, searchParams, sort]);

  const sortDropdown = (
    <div tw="flex gap-2 items-center">
      <label tw="font-semibold sm:text-lg text-white opacity-80">
        Sort by:
      </label>
      <Select
        tw="opacity-95 z-10"
        value={{ value: sort, label: capitalize(sort) }}
        onChange={(option) => option && onChangeSort(option.value)}
        isSearchable={false}
        options={SEARCH_SORTS.map((s) => {
          return {
            value: s,
            label: capitalize(s),
          } as any;
        })}
      />
    </div>
  );
  const inlineSort = breakpoint === 'xs';

  return (
    <>
      <TopicList topics={visibleTopics} compact={!!filterText} />
    </>
  );
}
