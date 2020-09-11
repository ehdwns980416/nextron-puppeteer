import React from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {Avatar, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText} from '@material-ui/core';
import WifiIcon from '@material-ui/icons/Wifi';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

export default function ScrapPage() {
    const classes = useStyles();

    return (
        <List className={classes.root}>
            <ListItem>
                <ListItemAvatar>
                    <Avatar alt="매일경제 로고" src="/images/mk_logo.png" />
                </ListItemAvatar>
                <ListItemText id="scrap-list-label-mk" primary="매일경제"/>
            </ListItem>
            <ListItem>
                <ListItemAvatar>
                    <Avatar alt="한국경제 로고" src="/images/hk_logo.png" />
                </ListItemAvatar>
                <ListItemText id="scrap-list-label-hk" primary="한국경제"/>
            </ListItem>
        </List>
    );
}
