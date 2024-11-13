const express = require('express')
const { SerialPort } = require('serialport')
const app = express()
const port = 4000
const cors = require('cors')

const serialPorts = {
	COM3: new SerialPort({ path: 'COM3', baudRate: 9600 }),
	//COM2: new SerialPort({ path: 'COM2', baudRate: 9600 }),
	// 다른 포트 추가 가능
}

app.use(express.json()).use(cors())

// 차단기 오픈 API (포트 번호를 파라미터로 받음)
app.post('/open-gate/:port', async (req, res) => {
	console.log('req', req)
	console.log('res', res)
	const { port: serialPortName } = req.params // 요청된 포트 번호 (예: COM1, COM2, COM3, COM4)
	const serialPort = serialPorts[serialPortName]

	if (!serialPort) {
		return res.status(400).json({ success: false, message: '지원하지 않는 포트입니다.' })
	}

	try {
		// 시리얼 포트에 차단기 오픈 명령 전송
		await serialPort.write('#011101\r\n') // 예시 명령어
		console.log(`포트 ${serialPortName}: 차단기 오픈`)

		setTimeout(async () => {
			await serialPort.write('#011100\r\n') // 차단기 내림
			console.log(`포트 ${serialPortName}: 차단기 내림`)
		}, 3000)

		res.status(200).json({ success: true, message: '차단기 오픈 완료' })
	} catch (error) {
		console.error(`포트 ${serialPortName} 시리얼 통신 오류:`, error)
		res.status(500).json({ success: false, message: '차단기 오픈 실패' })
	}
})

app.listen(port, () => {
	console.log(`Node.js 서버가 ${port} 포트에서 실행 중입니다.`)
})
