import { useState } from 'react';

import { useCurrentUser } from '@/hooks/useCurrentUser';

export const IndexPage = () => {
  const { currentUser } = useCurrentUser();

  const [res, setRes] = useState('');

  const onClickEchoIdTokenButtonHandler = async () => {
    if (!currentUser) return;
    const idToken = await currentUser.getIdToken();
    fetch('http://127.0.0.1:8787/echo-id-token', {
      headers: {
        Authorization: idToken,
      },
      method: 'GET',
    })
      .then(async (r) => {
        if (!r.ok) alert(r.status);
        const data = await r.json();
        setRes(JSON.stringify(data, null, 2));
      })
      .catch((e) => alert(String(e)));
  };

  return (
    <div>
      <pre>Res: {res}</pre>
      <button onClick={onClickEchoIdTokenButtonHandler}>ECHO ID TOKEN</button>
    </div>
  );
};
