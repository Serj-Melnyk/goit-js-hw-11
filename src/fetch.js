import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const key = '32804651-81b33072ba9641590fc1a4880';
const per_page = 40;

export const fetchApi = async (name, page) => {
  const result = await axios.get(
    `${BASE_URL}?key=${key}&q=${name}&images_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`
  );
  return result.data;
};
