document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const parseBtn = document.getElementById('parseBtn');
  const loading = document.getElementById('loading');
  const resultContainer = document.getElementById('resultContainer');
  const videoContainer = document.getElementById('videoContainer');
  const imagesContainer = document.getElementById('imagesContainer');
  const videoPlayer = document.getElementById('videoPlayer');
  const imagesGrid = document.getElementById('imagesGrid');
  const downloadVideo = document.getElementById('downloadVideo');
  const downloadAllImages = document.getElementById('downloadAllImages');

  parseBtn.addEventListener('click', function() {
    const url = urlInput.value.trim();
    if (!url) {
      alert('请输入短视频链接');
      return;
    }
    
    // 显示加载状态
    loading.style.display = 'flex';
    resultContainer.style.display = 'none';
    videoContainer.style.display = 'none';
    imagesContainer.style.display = 'none';
    
    // 调用API解析短视频
    fetchVideoData(url);
  });

  function fetchVideoData(url) {
    const apiUrl = 'https://api.coze.cn/v1/workflow/run';
    const requestData = {
      parameters: {
        url: url
      },
      workflow_id: "7490015971840868391"
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat_PDGLQr3k8lx2xqaC892IZN8fDroz3ec9CTNnSXTXIg3TEb8vbfQJAlFOfxRtSFo2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(result => {
      loading.style.display = 'none';
      
      if (result.code === 0) {
        const data = JSON.parse(result.data);
        displayResult(data);
      } else {
        alert('解析失败，请检查链接是否正确');
      }
    })
    .catch(error => {
      loading.style.display = 'none';
      alert('解析出错: ' + error.message);
    });
  }

  function displayResult(data) {
    resultContainer.style.display = 'block';
    
    if (data.type === 1) {
      // 视频类型
      videoContainer.style.display = 'block';
      videoPlayer.src = data.videoUrl;
      videoPlayer.load();
      
      // 设置下载视频按钮事件
      downloadVideo.addEventListener('click', function() {
        downloadFile(data.videoUrl, '无水印视频.mp4');
      });
    } else if (data.type === 2) {
      // 图文类型
      imagesContainer.style.display = 'block';
      imagesGrid.innerHTML = '';
      
      if (data.images && data.images.length > 0) {
        data.images.forEach((imageUrl, index) => {
          const imageItem = document.createElement('div');
          imageItem.className = 'image-item';
          
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = `图片${index + 1}`;
          
          const downloadBtn = document.createElement('button');
          downloadBtn.className = 'download-single';
          downloadBtn.textContent = '下载';
          downloadBtn.addEventListener('click', function() {
            downloadFile(imageUrl, `无水印图片${index + 1}.jpg`);
          });
          
          imageItem.appendChild(img);
          imageItem.appendChild(downloadBtn);
          imagesGrid.appendChild(imageItem);
        });
        
        // 设置下载全部图片按钮事件
        downloadAllImages.addEventListener('click', function() {
          data.images.forEach((imageUrl, index) => {
            setTimeout(() => {
              downloadFile(imageUrl, `无水印图片${index + 1}.jpg`);
            }, index * 500); // 间隔下载，避免浏览器阻止
          });
        });
      }
    }
  }

  function downloadFile(url, filename) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      })
      .catch(error => {
        alert('下载失败: ' + error.message);
      });
  }
});