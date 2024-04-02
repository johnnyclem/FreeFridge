import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { TopicInfo, useTopicStore } from '../stores/topicStore';
import { defaultTagColor } from './Tag';

const Form = styled.form`
  ${tw`w-full flex flex-col gap-3`}

  a {
    ${tw`text-blue-500`}
  }

  label {
    ${tw`flex flex-col gap-1 w-full text-xl font-semibold`}
    > * {
      ${tw`text-lg font-normal`}
    }
  }

  input[type='text'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

const developerForumBaseUrl = 'https://forum.dfinity.org/';

export interface TopicFormProps {
  initial?: TopicInfo;
  onSubmit?(info: TopicInfo): void | Promise<void>;
}

export default function TopicForm({ initial, onSubmit }: TopicFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState(
    () =>
      initial || {
        title: '',
        description: '',
        links: [],
        tags: [],
      },
  );

  const tags = useTopicStore((state) => state.tags);

  const isValid = () => {
    return info.description.length > 1;
  };

  const patch = (partialInfo: Partial<TopicInfo>) =>
    setInfo({ ...info, ...partialInfo });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting && isValid()) {
          const promise = onSubmit?.(info);
          if (promise) {
            setSubmitting(true);
            promise.finally(() => setSubmitting(false));
          }
        }
      }}
    >
      <label>
        Your note:
        <textarea
          tw="mb-0"
          rows={5}
          value={info.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </label>
      <button
        tw="mt-5 w-full px-8 py-3 border-2 bg-[#fff8] border-primary text-primary hover:bg-primary hover:text-white font-bold text-xl rounded-xl"
        type="submit"
      >
        {initial ? 'Save Changes' : 'Submit'}
      </button>
    </Form>
  );
}
