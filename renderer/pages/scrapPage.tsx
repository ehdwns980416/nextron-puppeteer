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
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';

import scrapNews from "../services/puppeteer";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper,
        },
        label: {
            minWidth: 100,
        },
        progress: {
            width: '100%',
        },
        progressMessage: {
            position: 'absolute',
            bottom: '-5px',
            left: '172px',
        }
    }),
);

const initialPressList = [
    {
        name: '매일경제',
        logo_url: '/images/mk_logo.png',
        progressValue: 0,
        progressMessage: '',
        mode: 'mk',
        isScrapping: false,
    },
    {
        name: '한국경제',
        logo_url: '/images/hk_logo.png',
        progressValue: 0,
        progressMessage: '',
        mode: 'hk',
        isScrapping: false,
    }
]

const ScrapPage = (props) => {

    let setTabIndex = props.setTabIndex;
    let setNewsList = props.setNewsList;

    const classes = useStyles();

    const [pressList, setPressList] = useState(initialPressList);

    const setProgressStat = (pressIndex, msg: string, value: number) => {
        console.log(msg);
        pressList[pressIndex].progressMessage = msg;
        if(value > 0) pressList[pressIndex].progressValue = value;
        setPressList(pressList => ([...pressList]));
    }

    const startProgress = (i) => {
        let mode = pressList[i].mode;
        if (mode == 'mk' || mode == 'hk') {
            scrapNews(mode, i, setProgressStat).then((result) => {
                setProgressStat(i, '['+(mode == "mk" ? "매경" : "한경")+'] 스크랩 완료', 100);
                pressList[i].isScrapping = false;
                setPressList(pressList => ([...pressList]));
                console.log(result);
                // TODO: 리스트에 넣어주기
                setNewsList(result);
                setTabIndex(1);
            })
            pressList[i].isScrapping = true;
            setPressList(pressList => ([...pressList]));
        }
    }

    const stopProgress = (i) => {
        let mode = pressList[i].mode;
        if (mode == 'mk' || mode == 'hk') {
            pressList[i].isScrapping = false;
            pressList[i].progressValue = 0;
            pressList[i].progressMessage = '';
            setPressList(pressList => ([...pressList]));
        }
    }

    return (
        <List className={classes.root}>
            {pressList.map((press, i) => {
                return (
                    <ListItem key={i}>
                        <ListItemAvatar>
                            <Avatar src={press.logo_url}/>
                        </ListItemAvatar>
                        <ListItemText id="scrap-list-label-mk" primary={press.name} className={classes.label}/>
                        <div className={classes.progress}>
                            <LinearProgress variant="determinate" value={press.progressValue}/>
                        </div>
                        <span className={classes.progressMessage}>{press.progressMessage}</span>
                        <ListItemSecondaryAction>
                            {!press.isScrapping ?
                            <IconButton edge="end" aria-label="start" onClick={() => startProgress(i)}>
                                <PlayArrowIcon/>
                            </IconButton> :
                            <IconButton edge="end" aria-label="stop" onClick={() => stopProgress(i)}>
                                <StopIcon/>
                            </IconButton>
                            }
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
}

export default ScrapPage;
