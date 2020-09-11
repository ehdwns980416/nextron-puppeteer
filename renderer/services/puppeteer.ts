import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import * as $ from 'jquery';

let newsList = [];

/**
 * getPic(url)
 *
 * function
 *
 * Goes to the provided url paramter and takes a screenshot of that page.
 *
 * @param {String} url - A URL to provide of a website to screenshot.
 */
export default async function scrapMKNews() {
    // 브라우저 옵션 설정
    const browserOption = {
        slowMo: 500, // 디버깅용으로 퍼핏티어 작업을 지정된 시간(ms)만큼 늦춥니다.
        headless: false // 디버깅용으로 false 지정하면 브라우저가 자동으로 열린다.
    };

    const browser = await puppeteer.launch(browserOption);
    const page = await browser.newPage();

    let pageNo = 0;
    let thisDate = '20200910';

    while(true) {
        let response;
        try {
            // 리다이렉트 되는 페이지의 주소를 사용.
            const url = 'https://www.mk.co.kr/news/all/?page='+pageNo+'&thisDate='+thisDate;

            // 탭 옵션
            const pageOption = {
                // waitUntil: 적어도 500ms 동안 두 개 이상의 네트워크 연결이 없으면 탐색이 완료된 것으로 간주합니다.
                waitUntil: 'networkidle2',
                // timeout: 20초 안에 새 탭의 주소로 이동하지 않으면 에러 발생
                timeout: 20000
            };

            response = await page.goto(url, pageOption);
        } catch (error) {
            await page.close();
            await browser.close();

            console.error(error);
            return;
        }

        let html;
        try {
            // 4. 웹페에지의 페이지 소스를 확인한다. => 페이지 소스 코드를 얻는다.
            html = await response.text();
        } catch (error) {
            console.error(error);
            return;
        }
        // cheerio 라이브러리를 사용하여 html을 DOM 으로 파싱합니다.
        const $$ = cheerio.load(html);
        // 기사 리스트 받아오기
        const articleList = $$('dl.article_list');
        if(articleList.length > 0) {
            let result = extractNewsList(articleList);
            if(result.length > 0) newsList = newsList.concat(result);
            pageNo += 1;
            //Todo: 테스트 중이라 몇 페이지만 가저오게 설정함
            if(pageNo > 1) break;
        }
        else {
            break;
        }
    }
    await page.close();
    await browser.close();

    newsList = duplicateCheck(newsList);

    setNewsDataToList(newsList);
}

function extractNewsList(articleList) {
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

function setNewsDataToList(newsList) {
    console.log(newsList);
    // $.each(newsList, function (i, news) {
    //     let template = `
    //     <li class="list-group-item flex-column align-items-start news-item">
    //     <div class="image-box">
    //       <img src="${(news.image || "https://via.placeholder.com/100X50")}">
    //     </div>
    //     <div class="content-box">
    //       <div class="d-flex w-100 justify-content-between">
    //         <h5 class="mb-1">${news.title}</h5>
    //       </div>
    //       <small>${news.date}</small>
    //     </div>
    //     <div class="tool-box">
    //       <button class="remove-btn text-danger" data-url="${news.link}">
    //         <i class="fa fa-minus-circle"></i>
    //       </button>
    //     </div>
    //   </li>
    //     `;
    //     $("ul.news-list").append(template);
    // });
}
