import { ref } from "vue";

export const usePagination = ({ page = 1, rowsPerPage = 50 } = {}) => {
  return {
    page: ref(page),
    rowsPerPage: ref({
      label: rowsPerPage.toString(),
      value: rowsPerPage,
    }),
  };
};
