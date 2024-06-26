import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'twin.macro';
import useIdentity from '../../hooks/useIdentity';
import { useTopicStore } from '../../stores/topicStore';
import { handleError } from '../../utils/handlers';
import Loading from '../Loading';
import TopicView from '../TopicView';

let fetchId: string | undefined;

export default function TopicPage() {
  const user = useIdentity();
  const topicLookup = useTopicStore((state) => state.topicLookup);
  const find = useTopicStore((state) => state.find);
  const navigate = useNavigate();
  const { id } = useParams();

  const topic = id ? topicLookup[id] : null;

  useEffect(() => {
    if (user !== undefined && id && id !== fetchId) {
      fetchId = id;
      (async () => {
        try {
          if (!id) {
            return;
          }
          const topic = await find(id);
          if (!topic) {
            handleError('Topic not found!');
            navigate('/');
          }
        } catch (err) {
          handleError(err, 'Error while loading topic!');
        }
      })();
    }
  }, [find, id, navigate, user]);

  if (!topic) {
    return <Loading />;
  }

  return (
    <>
      <TopicView topic={topic} expanded={true} />
    </>
  );
}
