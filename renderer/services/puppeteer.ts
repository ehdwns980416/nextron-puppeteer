import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import * as $ from 'jquery';

let newsList = [];

export default async function scrapNews(mode: 'mk' | 'hk', i: number, setProgressStat: any) {
    const pressName = mode == 'mk' ? '매경' : '한경';
    const pressIndex = i;
    let pressProgressValue = 15; //시작은 15로
    setProgressStat(pressIndex, pressName + ' 스크랩 시작', pressProgressValue);

    // 브라우저 옵션 설정
    const browserOption = {
        slowMo: 500, // 디버깅용으로 퍼핏티어 작업을 지정된 시간(ms)만큼 늦춥니다.
        headless: false, // 디버깅용으로 false 지정하면 브라우저가 자동으로 열린다.
        ignoreDefaultArgs: ['--disable-extensions'],
    };

    console.log('start puppeteer');
    const browser = await puppeteer.launch(browserOption);
    console.log(browser);
    const page = await browser.newPage();

    let pageNo = 0;
    let thisDate = '20200920';

    while(true) {
        let response;
        try {
            let url = '';
            if(mode == 'mk') url = 'https://www.mk.co.kr/news/all/?page='+pageNo+'&thisDate='+thisDate;
            // TODO: 한경) date부분 2020.09.10 이런식으로 .이 들어가도록 가공 필요
            else if(mode == 'hk') url = 'https://www.hankyung.com/all-news/?sdate='+thisDate+'&edate='+thisDate+'&page='+(pageNo+1);

            // 탭 옵션
            const pageOption = {
                // waitUntil: 적어도 500ms 동안 두 개 이상의 네트워크 연결이 없으면 탐색이 완료된 것으로 간주합니다.
                waitUntil: 'networkidle2',
                // timeout: 20초 안에 새 탭의 주소로 이동하지 않으면 에러 발생
                timeout: 20000
            };

            // pressProgressValue의 경우, 진행 중에는 pageNo * 3을 기준으로
            // 20 페이지가 있다 가정하면 60%가 진행으로
            // 만약 페이지가 더 있으면 75%로 고정
            const pn = mode == "mk" ? pageNo+1 : pageNo;
            const pv = pressProgressValue + (pn*3) > 75 ? 75 : pressProgressValue + (pageNo*3);
            setProgressStat(pressIndex, '['+pressName+'] '+pn+'페이지 스크랩 중...', pv);
            response = await page.goto(url, pageOption);
        } catch (error) {
            await page.close();
            await browser.close();

            setProgressStat(pressIndex, '에러 발생 (관리자에게 문의해주세요.)', 0);
            console.error(error);
            return;
        }

        let html;
        try {
            // 4. 웹페에지의 페이지 소스를 확인한다. => 페이지 소스 코드를 얻는다.
            html = await response.text();
        } catch (error) {
            await page.close();
            await browser.close();

            setProgressStat(pressIndex, '에러 발생 (관리자에게 문의해주세요.)', 0);
            console.error(error);
            return;
        }

        // cheerio 라이브러리를 사용하여 html을 DOM 으로 파싱
        const $$ = cheerio.load(html);

        // 기사 리스트 받아오기
        let articleList = null;
        if(mode == 'mk') articleList = $$('dl.article_list');
            // TODO: 한경) 리스트 태그 확인
        else if(mode == 'hk') articleList = $$('tag');

        if(articleList.length > 0) {
            let result = mode == 'mk' ? extractMKNewsList(articleList) : extractHKNewsList(articleList);
            if(result.length > 0) newsList = newsList.concat(result);
            setProgressStat(pressIndex, '['+pressName+'] '+(mode == "mk" ? pageNo+1 : pageNo)+'페이지 스크랩 완료', null);
            pageNo += 1;
            //Todo: 테스트 중이라 몇 페이지만 가저오게 설정함
            if(pageNo > 2) break;
        }
        else {
            break;
        }
    }
    await page.close();
    await browser.close();

    setProgressStat(pressIndex, '['+pressName+'] 중복 기사 체크 중...', 90);
    newsList = duplicateCheck(newsList);

    return newsList;
}

function extractMKNewsList(articleList) {
    newsList = [];

    for (let i = 0; i < articleList.length; i += 1) {
        const newsData = {
            title: null,
            link: null,
            description: null,
            date: null,
            image: null
        };

        const element = cheerio(articleList[i]);
        // 자식 element 값 가져오기
        for (let j = 0; j < element.children().length; j += 1) {
            const child = cheerio(element.children()[j]);

            // 자식의 class 가져오기
            let childClass = child.attr('class');
            childClass = childClass.trim();

            // 추출한 class 에 따라 역할 지정
            switch (childClass) {
                case 'thumb':
                    newsData.image = child.find('img')[0].attribs.src;
                    break;
                case 'tit':
                    newsData.title = child.children('a')[0].children[0].data;
                    newsData.link = child.children('a')[0].attribs.href;
                    break;
                case 'desc':
                    newsData.description = (child.children('span.desctxt')[0].children[0].data).trim();
                    newsData.date = child.children('span.date')[0].children[0].data;
                    break;
                default:
                    break;
            }
        }

        newsList.push(newsData);
    }

    return newsList;
}

function extractHKNewsList(articleList) {
    console.log(articleList);
    return articleList;
}

function duplicateCheck(newsList) {
    // 링크 별로 sorting
    let sortedArray = newsList.sort(function (a, b) {
        return a.link < b.link ? -1 : a.link > b.link ? 1 : 0;
    });

    // 중복 부분 걸러내기
    let reportRecipientsDuplicate = [];
    for (let i = 0; i < sortedArray.length - 1; i++) {
        if (sortedArray[i + 1].link == sortedArray[i].link) {
            reportRecipientsDuplicate.push(sortedArray[i]);
        }
    }

    // 중복이 있으면...
    if(reportRecipientsDuplicate.length > 0) {
        $.each(reportRecipientsDuplicate, function (i, data) {
            newsList.splice( $.inArray(data, newsList), 1 );
        })
    }

    return newsList;
}
