declare namespace UserInfo {
    type CurrentUser = {
        id?: string;
        name?: string;
        loginName?: string;
        avatar?: string;
        phoneNum?: string;
        email?: string;
        canVisit?: string;
        roleId?: string;
    }

    type LoginResult = {
        status?: string;
    }
}