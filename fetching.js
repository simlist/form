import {useState, useEffect} from 'react';
import * as Cookies from 'js-cookie';

export const protocol = process.env.API_PROTOCOL;
const credentials = (protocol == 'https') ? 'same-origin' : 'include'; 
export const host = process.env.API_HOST;
const apiPath = `${protocol}://${host}/api/`;
const contentPath = `${protocol}://${host}/content/`;

const headers ={
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

const useFetchingBase = (methodName, url, initData=null) => {
  const [loading, setLoading] = useState(false);
  const [fetchData, setFetchData] = useState({});
  const [data, setData] = useState([]);
  const [shouldSend, setShouldSend] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const [ok, setOk] = useState(null);

  const clear = () => {
    setLoading(false);
    setData([]);
    setShouldSend(false);
    setStatusCode(null);
    setOk(null);
  }

  const send = (formData) => {
    if (formData) {
      if (initData) {
        setFetchData({...initData, ...formData});
      }
      else setFetchData(formData);
    }
    setShouldSend(true);
  }

  useEffect(() => {
    if (shouldSend) {
      setLoading(true);
      setStatusCode(null);
      setOk(null);
      if (methodName !== 'GET') {
        headers['X-CSRFToken'] = Cookies.get('csrftoken');
      }
      const fetcher = async () => {
        const init = {
          method: methodName,
          headers: headers,
          mode: 'cors',
          credentials: credentials
        }
        if (Object.keys(fetchData).length) {
          init.body = JSON.stringify(fetchData);
        }
        try {
          const response = await fetch(url, init);
          if (response.headers.get('content-type')) {
            const fetchedData = await response.json();
            setData(fetchedData);
          }
          setStatusCode(response.status);
          setOk(response.ok);
        } catch(e) {
            setStatusCode(404);
            console.log(e);
        } finally {
          setLoading(false);
          setShouldSend(false);
        }
      }
        fetcher();
    }
  }, [shouldSend,]);
  return {
    data: data, loading: loading, statusCode: statusCode,
    ok: ok, send: send, setData: setData, clear: clear};
}

export const useGetContent = path => useFetchingBase('GET', contentPath + path);

export const useGet = (path) => useFetchingBase('GET', apiPath + path);

export const usePost = (path, data) => useFetchingBase('POST', apiPath + path, data);

export const usePut = (path, data) => useFetchingBase('PUT', apiPath, + path, data);

export const usePatch = (path, data) => useFetchingBase('PATCH', apiPath + path, data);

export const useDelete = (path) => useFetchingBase('DELETE', apiPath + path)

export const useAuth = () => {
  const [action, setAction] = useState('');
  const [formData, setFormData] = useState({});
  const [loggedIn, setLoggedIn] = useState(true);
  const url = `${apiPath}auth/`;
  const {data, statusCode, ok, loading, send, clear} = useFetchingBase(
    'POST', `${url}${action}/`);

  useEffect(() => {
    if (ok && (action === 'login')) {
      setLoggedIn(true);
    }
    else if (statusCode === 401 || (action === 'logout' && ok)) {
      setLoggedIn(false);
    }
    if (ok === false) {
      setAction('');
      setFormData({});
    }
  }, [ok, statusCode])

  useEffect(() => {
    if (action) {
      if ((action === 'login' && formData.email) || action === 'logout') {
        send(formData);
      }
    }
  }, [action]);

  const login = (email, password) => {
    setAction('login');
    setFormData({email: email, password: password});
  }

  const logout = () => {
    setAction('logout');
    setFormData({});
    setLoggedIn(false);
    clear();
  }
  return {loading: loading, loggedIn: loggedIn, statusCode: statusCode,
    setLoggedIn: setLoggedIn, login: login, logout: logout, data: data};
}