import * as React from 'react';

import { clx } from './utils/stringUtils.ts';

function Button(props: React.ButtonHTMLAttributes<Element> & React.PropsWithChildren) {
  const { className, ...rest } = props;

  return (
    <button
      className={clx(
        'px-2 py-0.5 border border-gray-400 rounded bg-slate-50',
        'hover:shadow-md hover:border-gray-600',
        'active:shadow-inner active:bg-slate-100',
        className,
      )}
      {...rest}
    />
  );
}

export default Button;
