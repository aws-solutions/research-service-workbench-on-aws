import axios from 'axios';

const urlBase = process.env.API_BASE_URL;

const httpApiGet = async (urlPath: string, params: any): Promise<any> => {
  const options = {
    method: 'GET',
    url: `${urlBase}${urlPath}`,
    data: params
  };
  return await fetchData(options);
};
const httpApiPost = async (urlPath: string, params: any): Promise<any> => {
  const options = {
    method: 'POST',
    url: `${urlBase}${urlPath}`,
    data: params
  };
  return true;
};
const httpApiPut = async (urlPath: string, params: any): Promise<any> => {
  const options = {
    method: 'PUT',
    url: `${urlBase}${urlPath}`,
    data: params
  };
  return await fetchData(options);
};
const httpApiDelete = async (urlPath: string, params: any): Promise<any> => {
  const options = {
    method: 'DELETE',
    url: `${urlBase}${urlPath}`,
    data: params
  };
  return await fetchData(options);
};

const fetchData = async (options: any): Promise<any> => {
  //TODO add auth token and error handling
  const { data } = await axios(options).catch(function (error) {
    //TODO: call logger to capture exception
    throw 'there was an error while trying to retrieve data1';
  });
  return data;
};

export { httpApiGet, httpApiPost, httpApiPut, httpApiDelete };
