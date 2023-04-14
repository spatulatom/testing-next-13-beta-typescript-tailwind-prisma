
import React from 'react';
import { PostType } from '../types/Post';
import { memo } from 'react';
type count = {
  count: PostType[];
};

const Counter = ({ count }: count) => {
  return <h2 className="ml-2">All posts: {count.length}</h2>;
}


// practicing mamo() and how it dosent prevent rerender in server componets decendnets
// export default memo(Counter);

export default Counter;