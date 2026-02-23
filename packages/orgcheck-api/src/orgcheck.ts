import { API } from 'src/api/orgcheck-api-impl';


class OrgCheck {
    API: typeof API = API;
}

const orgcheck = new OrgCheck();
export default orgcheck;
