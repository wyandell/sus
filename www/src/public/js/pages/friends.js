let offset = 0;
let userId = parseInt($('#FriendsContainer').attr('data-user-id'), 10);
let friends = [];

const loadFriendsPage = () => {
    let table = $('#user-friends-table').empty();
    let selected = friends[offset];
    if (!selected) {
        return;
    }
    for (const row of selected) {
        table.append(`
        
        <tr></tr>
        
        `);
        let tr = table.find('tr').last();
        console.log('batch  of', row.length);
        for (const friend of row) {
            tr.append(`
            
            <td>
                    <div class="Friend notranslate">
                        <div class="Avatar"><a id="ctl00_cphRoblox_rbxFriendsPane_dlFriends_ctl00_hlAvatar"
                                title="${friend.name}" href="/User.aspx?ID=${friend.id}"
                                style="display:inline-block;height:100px;width:100px;cursor:pointer;"><img
                                    src="/Thumbnail/User.ashx?id=${friend.id}" height="100" width="100" border="0"
                                    onerror="return Roblox.Controls.Image.OnError(this)" alt="${friend.name}" /><img
                                    src="/api/v1/builders-club/users/${friend.id}/redirect-to-icon" align="left"
                                    style="position:relative;top:-19px;" /></a></div>
                        <div class="Summary">
                            <span class="OnlineStatus" data-user-id="${friend.id}"></span>
                            <span class="Name"><a id="ctl00_cphRoblox_rbxFriendsPane_dlFriends_ctl00_hlFriend"
                                    href="/User.aspx?ID=${friend.id}">${friend.name}</a></span>
                        </div>
                    </div>
                </td>

            `);
        }
    }
}

const loadFriends = () => {
    return web.get('/users/' + userId + '/friends?mode=profile').then(d => {
        friends = d.data;
        $('#friend-count').html(d.total);
    });
}
loadFriends().then(() => {
    loadFriendsPage();
}).catch(err => {
    console.error('error loading friends', err);
})

const onPagerClick = (e) => {
    e.preventDefault();
}

$(document).on('click', '#load-next-friends-page', function (e) {
    onPagerClick(e);
    if (offset >= (friends.length - 1)) {
        $('#load-next-friends-page').hide();
        return;
    }
    offset += 1;
    if (offset > 0) {
        $('#load-previous-friends-page').show();
    }
    if (offset === 0) {
        $('#load-previous-friends-page').hide();
    }
    if (offset >= (friends.length - 1)) {
        $('#load-next-friends-page').hide();
    }
    loadFriendsPage();
});
$(document).on('click', '#load-previous-friends-page', function (e) {
    onPagerClick(e);
    if (offset > 0) {
        $('#load-previous-friends-page').show();
    }
    if (offset === 0) {
        $('#load-previous-friends-page').hide();
        return;
    }
    if (offset - 1 === 0) {
        $('#load-previous-friends-page').hide();
    }
    if (offset < (friends.length - 1)) {
        $('#load-next-friends-page').show();
    }
    offset--;
    if (offset < (friends.length - 1)) {
        $('#load-next-friends-page').show();
    }
    loadFriendsPage();

});