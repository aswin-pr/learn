const mainContent = document.getElementById('main-content')
const menuItems = document.getElementById('menu-items')

document.addEventListener('DOMContentLoaded', () => {
    const videoId = window.location.pathname.split('/').pop();

    createMenu()
    getTranscript(videoId)
})

async function createMenu() {
    try {
      const data = await fetch('/videoData', {
        method: 'GET'
      })
  
      const jsonResponse = await data.json()
      jsonResponse.map(item => renderMenu(item.name, item.id))
    } catch (error) {
      console.error('error at line 20: ' + error)
    }
}

function renderMenu(itemName, attributeID) {
    const menuItem = document.createElement('p')
  
    menuItem.innerText = itemName
    menuItem.setAttribute('id', attributeID)
  
    menuItem.addEventListener('click', (e) => {
      e.preventDefault()
      window.location.href = `/watch/${attributeID}`
    })
  
    menuItems.appendChild(menuItem)
}

async function getTranscript(attributeID) {
    const result = await fetch(`/videoData/${attributeID}`, {
        method: 'GET'
      })
  
    const jsonResponse = await result.json()
    createUI(jsonResponse)
}

function createUI(data) {
    // Always clear the content first
    if (mainContent.children.length > 0) {
      mainContent.innerHTML = '';
    }
    
    const webPath = '/uploads/' + data.path.path.split('/uploads/')[1];
  
    // Video getting created
    createVideo(webPath);
  
    // Paragraph creation
    const paragraphs = data.allSentences;
    const allWords = data.allWords;
  
    let sentenceWord;
    for (const para of paragraphs) {
      sentenceWord = allWords.filter(word => {
        return word.start_time >= para.start_time && word.end_time <= para.end_time;
      });
  
      const paraDiv = document.createElement('div');
      paraDiv.style.width = 'inherit'
      const videoElement = document.getElementById('video');
  
      sentenceWord.map(element => {
        const p = document.createElement('p');
        p.innerHTML = element.punctuated_word + '&nbsp;';
        p.setAttribute('startTime', element.start);
        p.setAttribute('endTime', element.start);
        p.addEventListener('click', () => {
          videoElement.currentTime = element.start;
        });
        tagWord(videoElement, p, element);
        paraDiv.appendChild(p);
      });
      
      mainContent.appendChild(paraDiv);
    }
}


function createVideo(src) {
    const video = document.createElement('video')
    video.setAttribute('id', 'video')
    video.src = src
    video.controls = true;
    mainContent.append(video)
}

function tagWord(videoPlayer, paraElement, currentWord) {
    videoPlayer.addEventListener('play', (e) => {
      setInterval(() => {
        const currentTime = videoPlayer.currentTime;
  
        if (currentTime > currentWord.start && currentTime < currentWord.end) {
          if (!paraElement.matches(':hover')) {
            paraElement.style.background = 'yellow'
          }
        } else if (currentTime > currentWord.start_time && currentTime < currentWord.end_time) {
          if (!paraElement.matches(':hover')) {
            paraElement.style.background = 'yellow'
          }
        } else {
          if (!paraElement.matches(':hover')) {
            paraElement.style.background = 'transparent';
          }
        }
      }, 100);
  
    }, 100)
}