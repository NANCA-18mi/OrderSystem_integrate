// pages/api/updateCookStatus.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();

  const { id } = req.query;  // クエリパラメータからidを取得
  const { getStatus } = req.body; // 更新するcookStatusをリクエストボディから取得

  // cookStatusがtrueまたはfalse以外の場合のバリデーション
  if (typeof getStatus !== 'boolean') {
    return res.status(400).json({ success: false, message: 'getStatus must be a boolean value' });
  }

  try {
    const updatedStatus = await StoreOrder.findByIdAndUpdate(id, { getStatus: getStatus }, {
      new: true, // 更新後のドキュメントを返す
      runValidators: true, // バリデーションを実行
    });

    if (!updatedStatus) {
      return res.status(404).json({ success: false, message: 'Status not found' });
    }

    res.status(200).json(updatedStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}