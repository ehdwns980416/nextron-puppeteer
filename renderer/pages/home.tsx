import React, {useEffect} from 'react';
import Head from 'next/head';
import {Theme, makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import ScrapPage from './scrapPage';
import NewsListPage from "./newsListPage";

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography component="div">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

const Home = () => {
    const classes = useStyles({});
    const [value, setValue] = React.useState(0);
    const [newsList, setNewsList] = React.useState([]);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <React.Fragment>
            <Head>
                <title>News Scrapper</title>
            </Head>
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                        <Tab label="스크랩" {...a11yProps(0)} />
                        <Tab label="뉴스목록" {...a11yProps(1)} />
                        <Tab label="Item Three" {...a11yProps(2)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    <ScrapPage setNewsList={scrapList => setNewsList(scrapList)} setTabIndex={setValue.bind(this)}/>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <NewsListPage scrapList={newsList}/>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    Item Three
                </TabPanel>
            </div>
        </React.Fragment>
    );
};

export default Home;
