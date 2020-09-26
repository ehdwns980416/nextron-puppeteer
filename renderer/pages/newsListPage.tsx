import React, {useEffect, useRef, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {
    Avatar,
    IconButton, LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

const NewsListPage = ({scrapList}) => {
    const classes = useStyles();

    return (
        <List className={classes.root}>
            {scrapList && scrapList.length > 0 ? scrapList.map((news, i) => {
                return (
                    <ListItem key={i}>
                        <ListItemAvatar>
                            <Avatar src={news.image}/>
                        </ListItemAvatar>
                        <ListItemText id="scrap-list-label-mk" primary={news.title}/>
                        <span>{news.description}</span>
                        <span>{news.date}</span>
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="stop">
                                <DeleteIcon/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            }) : "스크랩 된 뉴스가 없습니다."}
        </List>
    );
}

export default NewsListPage;

export class setNewsList {
}
