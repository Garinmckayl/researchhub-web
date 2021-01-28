import HubPage from "~/components/Hubs/HubPage";

import { getInitialScope } from "~/config/utils/dates";
import { slugToFilterQuery } from "~/config/utils/routing";
import { fetchPaperFeed } from "~/config/fetch";
import { filterOptions } from "~/config/utils/options";

const Index = (props) => {
  return <HubPage home={true} {...props} />;
};

Index.getInitialProps = async (ctx) => {
  const { query } = ctx;
  const { filter, page } = query;

  const defaultProps = {
    initialFeed: null,
    leaderboardFeed: null,
    initialHubList: null,
    feed: 1,
  };

  const PARAMS = {
    ordering: filter && slugToFilterQuery(filter),
    timePeriod: getInitialScope(),
    page: page || 1,
    hubId: 0,
  };

  try {
    const initialFeed = await fetchPaperFeed(PARAMS);
    const filterObj = filterOptions.filter(
      (el) => el.value === slugToFilterQuery(filter)
    )[0];

    return {
      initialFeed,
      query,
      filter: filterObj,
      feed: 1,
    };
  } catch {
    return defaultProps;
  }
};

export default Index;
